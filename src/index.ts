import { Peripheral } from "@abandonware/noble";

const noble = require('@abandonware/noble');

const cscServiceUuid = '0x1816';

noble.on('stateChange', async (state: string) => {
  if (state === 'poweredOn') {
    await noble.startScanningAsync([cscServiceUuid], false);
  }
});

noble.on('discover', async (peripheral: Peripheral) => {
  await noble.stopScanningAsync();
  await peripheral.connectAsync();
  console.log(`${peripheral.address} (${peripheral.advertisement.localName})`);

  const {characteristics} = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
    [cscServiceUuid],
    ['0x2A5B', '0x2A5C']
  );

  {
    const cscFeatureCharacteristic = characteristics[1];
    const cscFeatureFlags: Number = (await cscFeatureCharacteristic.readAsync())[0];
    const cscFeatureSpeed: boolean = cscFeatureFlags && 1 ? true : false;
    const cscFeatureCadence: boolean = cscFeatureFlags && 2 ? true : false;
    console.log(`Feature: Speed:${cscFeatureSpeed}, Cadance:${cscFeatureCadence}`);
  }

  // Subscribe Speed / Cadance
  {
    const cscMeasurementCharacteristic = characteristics[0];
    cscMeasurementCharacteristic.on('read', async (data:any, isNotification: boolean) => {
      console.log(data);
    });
    cscMeasurementCharacteristic.subscribe();

    setInterval(async () => { true }, 500);
  }
});
