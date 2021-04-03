import { Constants } from "../Constants"
import { CSCMeasurement } from "../model/CSCMeasurement"

const bleno = require('@abandonware/bleno')

export class CSCMeasurementCharacteristic extends bleno.Characteristic {
  private loopHandle?: any
  private updateValueCallback?: (data: Buffer) => void
  private wheelRevCount: number
  private beforeCSCMeasurement?: CSCMeasurement

  constructor() {
    super({
      uuid: Constants.CSC_CHARACTERISTICS.CSC_MEASUREMENT_UUID,
      properties: ['notify'],
    })
    this.loopHandle = undefined
    this.updateValueCallback = undefined
    this.wheelRevCount = 0
    this.wheelRevEventTime = 0
    this.beforeCSCMeasurement = undefined
  }

  public onSubscribe(maxValueSize: number, updateValueCallback: (data: Buffer) => void): void {
    this.updateValueCallback = updateValueCallback
  }

  public onUnsubscribe(): void {
    this.updateValueCallback = undefined
  }

  public startLoop(): void {
    this.loopHandle = setInterval(() => {
      this.wheelRevCount += 5
      this.wheelRevEventTime += 600
      const currentCSCMeasurement = new CSCMeasurement(
        1,
        this.wheelRevCount,
        this.wheelRevEventTime,
        0,
        0,
      )
      if (this.updateValueCallback) {
        this.updateValueCallback(currentCSCMeasurement.toBinaryBuffer())
      }
    }, 800)
  }
}
