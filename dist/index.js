"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noble = require('@abandonware/noble');
const cscServiceUuid = '0x1816';
noble.on('stateChange', async (state) => {
    if (state === 'poweredOn') {
        await noble.startScanningAsync([cscServiceUuid], false);
    }
});
noble.on('discover', async (peripheral) => {
    await noble.stopScanningAsync();
    await peripheral.connectAsync();
    console.log(`${peripheral.address} (${peripheral.advertisement.localName})`);
    const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync([cscServiceUuid], ['0x2A5B', '0x2A5C']);
    {
        const cscFeatureCharacteristic = characteristics[1];
        const cscFeatureFlags = (await cscFeatureCharacteristic.readAsync())[0];
        const cscFeatureSpeed = cscFeatureFlags && 1 ? true : false;
        const cscFeatureCadence = cscFeatureFlags && 2 ? true : false;
        console.log(`Feature: Speed:${cscFeatureSpeed}, Cadance:${cscFeatureCadence}`);
    }
    // Subscribe Speed / Cadance
    {
        const cscMeasurementCharacteristic = characteristics[0];
        // cscMeasurementCharacteristic.on('notify', async (state) => {
        //   console.log(await cscMeasurementCharacteristic.readAsync());
        // });
        cscMeasurementCharacteristic.on('read', async (data, isNotification) => {
            console.log(data);
        });
        cscMeasurementCharacteristic.subscribe();
        setInterval(async () => { console.log('tick'); }, 500);
    }
});
//# sourceMappingURL=index.js.map