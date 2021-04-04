import bleno from "@abandonware/bleno";
import { Constants } from "../Constants";
import { CSCMeasurement } from "../model/CSCMeasurement";
import { CSCFeatureCharacteristic } from "./CSCFeatureCharacteristic";
import { CSCMeasurementCharacteristic } from "./CSCMeasurementCharacteristic";

const cscMeasurementCharacteristic = new CSCMeasurementCharacteristic();

export class CSCService extends bleno.PrimaryService {
  constructor() {
    super({
      uuid: Constants.CSC_SERVICE_UUID,
      characteristics: [cscMeasurementCharacteristic, new CSCFeatureCharacteristic()],
    });
  }

  public notifyMeasure(measure: CSCMeasurement): void {
    cscMeasurementCharacteristic.notifyMeasure(measure);
  }
}
