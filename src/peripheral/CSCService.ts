import { Constants } from "../Constants"
import { CSCFeatureCharacteristic } from "./CSCFeatureCharacteristic"
import { CSCMeasurementCharacteristic } from "./CSCMeasurementCharacteristic"

const bleno = require('@abandonware/bleno')
const cscMeasurementCharacteristic = new CSCMeasurementCharacteristic()
cscMeasurementCharacteristic.startLoop()

export class CSCService extends bleno.PrimaryService {
  constructor () {
    super({
      uuid: Constants.CSC_SERVICE_UUID,
      characteristics: [
        cscMeasurementCharacteristic,
        new CSCFeatureCharacteristic,
      ]
    })
  }
}
