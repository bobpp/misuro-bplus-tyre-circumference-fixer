import { Peripheral } from "@abandonware/noble"
import { CSCMeasurement } from "./CSCMeasurement"

const noble = require('@abandonware/noble')

const cscServiceUuid = '0x1816'

noble.on('stateChange', async (state: string) => {
  if (state === 'poweredOn') {
    await noble.startScanningAsync([cscServiceUuid], false)
  }
})

noble.on('discover', async (peripheral: Peripheral) => {
  await noble.stopScanningAsync()
  await peripheral.connectAsync()
  console.log(`${peripheral.address} (${peripheral.advertisement.localName})`)

  const {characteristics} = await peripheral.discoverSomeServicesAndCharacteristicsAsync(
    [cscServiceUuid],
    ['0x2A5B', '0x2A5C']
  )

  // Check Features
  {
    const cscFeatureCharacteristic = characteristics[1]
    const cscFeatureFlags: Number = (await cscFeatureCharacteristic.readAsync())[0]
    const cscFeatureSpeed: boolean = cscFeatureFlags && 1 ? true : false
    const cscFeatureCadence: boolean = cscFeatureFlags && 2 ? true : false
    console.log(`Feature: Speed:${cscFeatureSpeed}, Cadance:${cscFeatureCadence}`)
  }

  // Subscribe Speed / Cadance
  {
    const cscMeasurementCharacteristic = characteristics[0]
    let beforeCSCMeasurement: CSCMeasurement | null = null
    cscMeasurementCharacteristic.on('read', async (data: Uint8Array, isNotification: boolean) => {
      let currentCSCMeasurement = new CSCMeasurement(data)
      if (beforeCSCMeasurement) {
        console.log(`${new Date().toUTCString()} ${currentCSCMeasurement.calculateSpeed(beforeCSCMeasurement, 0.08)} km/h`)
      }
      beforeCSCMeasurement = currentCSCMeasurement
    })
    cscMeasurementCharacteristic.subscribe()
  }
})

// Main Loop
setInterval(async () => { true }, 500)
