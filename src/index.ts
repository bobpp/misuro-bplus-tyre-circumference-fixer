import noble, { Peripheral } from "@abandonware/noble";
import { Constants } from "./Constants";
import { CSCMeasurement } from "./model/CSCMeasurement";

noble.on("stateChange", async (state: string) => {
  if (state === "poweredOn") {
    await noble.startScanningAsync([Constants.CSC_SERVICE_UUID], false);
  }
});

noble.on("discover", async (peripheral: Peripheral) => {
  await noble.stopScanningAsync();
  await peripheral.connectAsync();
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
    let beforeCSCMeasurement: CSCMeasurement | null = null;
    cscMeasurementCharacteristic.on("read", async (data: Uint8Array, _isNotification: boolean) => {
      const currentCSCMeasurement = CSCMeasurement.buildFromRawBinary(data);
      if (beforeCSCMeasurement) {
        console.log(
          `${new Date().toUTCString()} ${currentCSCMeasurement.calculateSpeed(beforeCSCMeasurement, 0.08)} km/h`
        );
      }
      beforeCSCMeasurement = currentCSCMeasurement;
    });
    cscMeasurementCharacteristic.subscribe();
  }
});

// Main Loop
setInterval(async () => {
  true;
}, 500);
