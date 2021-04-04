import bleno from "@abandonware/bleno";
import { Constants } from "../Constants";
import { CPFeatureCharacteristic } from "./CPFeatureCharacteristic";
import { CPMeasurementChracteristic } from "./CPMeasurementCharacteristic";

const measureCharacteristic = new CPMeasurementChracteristic();
export class CPService extends bleno.PrimaryService {
  constructor() {
    super({
      uuid: Constants.CP_SERVICE_UUID,
      characteristics: [new CPFeatureCharacteristic(), measureCharacteristic],
    });
  }

  public notifyMeasure(data: Buffer): void {
    measureCharacteristic.notifyMeasure(data);
  }
}
