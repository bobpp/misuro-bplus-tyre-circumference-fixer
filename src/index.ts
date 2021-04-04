import bleno from "@abandonware/bleno";
import noble, { Peripheral } from "@abandonware/noble";
import Debug from "debug";
import { Constants } from "./Constants";
import { CSCMeasurement } from "./model/CSCMeasurement";
import { WheelRevConverter } from "./model/WheelRevConverter";
import { CSCService } from "./peripheral/CSCService";

const debug = Debug("index");

const cscService = new CSCService();
const wheelRevConverter = new WheelRevConverter(Constants.MISURO_BPLUS_TYRE_LENGTH, Constants.CONVERT_TYRE_LENGTH);

noble.on("stateChange", async (state: string) => {
  if (state === "poweredOn") {
    await noble.startScanningAsync([Constants.CSC_SERVICE_UUID], false);
  }
});

noble.on("discover", async (peripheral: Peripheral) => {
  peripheral.once("disconnect", async () => {
    await noble.startScanningAsync([Constants.CSC_SERVICE_UUID], false);
  });
  peripheral.once("connect", async () => {
    console.log(`${peripheral.address} (${peripheral.advertisement.localName})`);

    const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
      [Constants.CSC_SERVICE_UUID],
      [Constants.CSC_CHARACTERISTICS.CSC_MEASUREMENT_UUID, Constants.CSC_CHARACTERISTICS.CSC_FEATURE_UUID]
    );

    // Check Features
    {
      const cscFeatureCharacteristic = characteristics[1];
      const cscFeatureFlags: number = (await cscFeatureCharacteristic.readAsync())[0];
      const cscFeatureSpeed: boolean = cscFeatureFlags && 1 ? true : false;
      const cscFeatureCadence: boolean = cscFeatureFlags && 2 ? true : false;
      console.log(`Feature: Speed:${cscFeatureSpeed}, Cadance:${cscFeatureCadence}`);
    }

    // Subscribe Speed / Cadance
    {
      const cscMeasurementCharacteristic = characteristics[0];
      let lastStoppedAt = Date.now();
      let beforeOriginalMeasurement: CSCMeasurement | null = null;
      cscMeasurementCharacteristic.on("read", async (data: Uint8Array, _isNotification: boolean) => {
        const currentOriginalMeasurement = CSCMeasurement.buildFromRawBinary(data);
        // Check stop
        {
          if (beforeOriginalMeasurement) {
            if (currentOriginalMeasurement.isStopped(beforeOriginalMeasurement)) {
              const stopInterval = Date.now() - lastStoppedAt;
              debug(`Stop Detected, interval: ${stopInterval / 1000} sec`);
              if (stopInterval > 15 * 1000) {
                cscMeasurementCharacteristic.unsubscribe();
                bleno.stopAdvertising();
                peripheral.disconnect();
                return;
              }
            } else {
              lastStoppedAt = Date.now();
            }
          }
        }

        // Debug
        {
          if (beforeOriginalMeasurement) {
            debug(
              `${new Date().toUTCString()} ${currentOriginalMeasurement.calculateSpeed(
                beforeOriginalMeasurement,
                0.08
              )} km/h`
            );
          }
        }

        // Main Procedure
        {
          const currentMeasurement = CSCMeasurement.buildFromRawBinary(data);
          const currentWheelRev = wheelRevConverter.convertWheelRev(currentMeasurement);
          currentMeasurement.cumulativeWheelRevolutions = currentWheelRev;
          cscService.notifyMeasure(currentMeasurement);
        }

        beforeOriginalMeasurement = currentOriginalMeasurement;
      });
      cscMeasurementCharacteristic.subscribe();
    }
  });

  await noble.stopScanningAsync();
  await peripheral.connectAsync();
});

bleno.on("accept", async (address: string) => {
  console.log(`Connected from ${address}`);
});

bleno.on("stateChange", async (state: string) => {
  if (state == "poweredOn") {
    bleno.startAdvertising(Constants.DEVICE_NAME, [cscService.uuid]);
  } else {
    console.log(state);
  }
});

bleno.on("advertisingStart", async (err?: Error | null) => {
  if (!err) {
    bleno.setServices([cscService]);
  }
});

process.on("exit", () => {
  bleno.stopAdvertising();
  bleno.disconnect();
});
process.once("SIGINT", () => {
  process.exit();
});

// Main Loop
setInterval(async () => {
  true;
}, 500);
