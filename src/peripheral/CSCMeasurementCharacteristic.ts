import bleno from "@abandonware/bleno";
import { Constants } from "../Constants";

export class CSCMeasurementCharacteristic extends bleno.Characteristic {
  private updateValueCallback?: (data: Buffer) => void;

  constructor() {
    super({
      uuid: Constants.CSC_CHARACTERISTICS.CSC_MEASUREMENT_UUID,
      properties: ["notify"],
    });
    this.updateValueCallback = undefined;
  }

  public onSubscribe(maxValueSize: number, updateValueCallback: (data: Buffer) => void): void {
    this.updateValueCallback = updateValueCallback;
  }

  public onUnsubscribe(): void {
    this.updateValueCallback = undefined;
  }

  public notifyMeasure(data: Buffer): void {
    if (this.updateValueCallback) {
      this.updateValueCallback(data);
    }
  }
}
