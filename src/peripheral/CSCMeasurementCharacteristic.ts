import bleno from "@abandonware/bleno";
import { Constants } from "../Constants";
import { CSCMeasurement } from "../model/CSCMeasurement";

export class CSCMeasurementCharacteristic extends bleno.Characteristic {
  private updateValueCallback?: (data: Buffer) => void;

  constructor() {
    super({
      uuid: Constants.CSC_CHARACTERISTICS.CSC_MEASUREMENT_UUID,
      properties: ["notify"],
      descriptors: [
        new bleno.Descriptor({
          uuid: Constants.CLIENT_CHARACTERISTIC_CONFIGURATION,
          value: Buffer.from([0]),
        }),
      ],
    });
    this.updateValueCallback = undefined;
  }

  public onSubscribe(maxValueSize: number, updateValueCallback: (data: Buffer) => void): void {
    this.updateValueCallback = updateValueCallback;
  }

  public onUnsubscribe(): void {
    this.updateValueCallback = undefined;
  }

  public notifyMeasure(measure: CSCMeasurement): void {
    if (this.updateValueCallback) {
      this.updateValueCallback(measure.toBinaryBuffer());
    }
  }
}
