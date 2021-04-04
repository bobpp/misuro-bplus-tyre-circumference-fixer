import bleno from "@abandonware/bleno";
import noble, { Peripheral } from "@abandonware/noble";
import Debug from "debug";
import { Constants } from "./Constants";
import { CSCMeasurement } from "./model/CSCMeasurement";
import { WheelRevConverter } from "./model/WheelRevConverter";
import { CPService } from "./peripheral/CPService";
import { CSCService } from "./peripheral/CSCService";

const debug = Debug("index");

const cscService = new CSCService();
const cpService = new CPService();
const wheelRevConverter = new WheelRevConverter(Constants.MISURO_BPLUS_TYRE_LENGTH, Constants.CONVERT_TYRE_LENGTH);

noble.on("stateChange", async (state: string) => {
  if (state === "poweredOn") {
    await noble.startScanningAsync([Constants.CSC_SERVICE_UUID], false);
  }
});

noble.on("discover", async (peripheral: Peripheral) => {
  peripheral.once("disconnect", async () => {
    await noble.startScanningAsync([Constants.CSC_SERVICE_UUID, Constants.CP_SERVICE_UUID], false);
  });
  peripheral.once("connect", async () => {
    console.log(`${peripheral.address} (${peripheral.advertisement.localName})`);

    const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
      [Constants.CSC_SERVICE_UUID, Constants.CP_SERVICE_UUID],
      [
        Constants.CSC_CHARACTERISTICS.CSC_MEASUREMENT_UUID,
        Constants.CSC_CHARACTERISTICS.CSC_FEATURE_UUID,
        Constants.CP_CHARACTERISTICS.CP_MEASUREMENT_UUID,
        Constants.CP_CHARACTERISTICS.CP_FEATURE_UUID,
      ]
    );

    const [cscMeasurement, cscFeature, cpMeasurement, cpFeature] = characteristics;

    // Check Speed, Cadence and Power Features
    {
      const cscFeatureFlags: number = (await cscFeature.readAsync())[0];
      const cscFeatureSpeed: boolean = cscFeatureFlags && 1 ? true : false;
      const cscFeatureCadence: boolean = cscFeatureFlags && 2 ? true : false;

      const cpFeatureFlags: number = (await cpFeature.readAsync())[0];

      debug(`CSC Feature Flag Value: ${cscFeatureFlags}`);
      debug(`CSC Feature: Speed:${cscFeatureSpeed}, Cadance:${cscFeatureCadence}`);
      debug(`CP Feature Flag Value: ${cpFeatureFlags}`);
    }

    // Subscribe & Proxy Speed / Cadance
    {
      let lastStoppedAt = Date.now();
      let beforeOriginalMeasurement: CSCMeasurement | null = null;

      cscMeasurement.on("read", async (data: Uint8Array, _isNotification: boolean) => {
        const currentOriginalMeasurement = CSCMeasurement.buildFromRawBinary(data);
        // Check stop
        {
          if (beforeOriginalMeasurement) {
            if (currentOriginalMeasurement.isStopped(beforeOriginalMeasurement)) {
              const stopInterval = Date.now() - lastStoppedAt;
              debug(`Stop Detected, interval: ${stopInterval / 1000} sec`);
              if (stopInterval > 15 * 1000) {
                cscMeasurement.unsubscribe();
                cpMeasurement.unsubscribe();
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
                Constants.MISURO_BPLUS_TYRE_LENGTH
              )} km/h`
            );
          }
        }

        // Main Procedure
        {
          if (beforeOriginalMeasurement) {
            const currentMeasurement = CSCMeasurement.buildFromRawBinary(data);
            const currentWheelRev = wheelRevConverter.convertWheelRev(currentMeasurement, beforeOriginalMeasurement);
            currentMeasurement.cumulativeWheelRevolutions = currentWheelRev;
            cscService.notifyMeasure(currentMeasurement.toBinaryBuffer());
          }
        }

        beforeOriginalMeasurement = currentOriginalMeasurement;
      });
      cscMeasurement.subscribe();
    }

    // Subscribe & Proxy Power
    {
      cpMeasurement.on("read", async (data: Buffer) => {
        cpService.notifyMeasure(data);
      });
      cpMeasurement.subscribe();
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
    bleno.startAdvertising(Constants.DEVICE_NAME, [cscService.uuid, cpService.uuid]);
  } else {
    console.log(state);
  }
});

bleno.on("advertisingStart", async (err?: Error | null) => {
  if (!err) {
    bleno.setServices([cscService, cpService]);
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
