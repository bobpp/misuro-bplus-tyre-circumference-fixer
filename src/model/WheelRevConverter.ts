import Debug from "debug";
import { CSCMeasurement } from "./CSCMeasurement";
const debug = Debug("bobpp/model/WheelRevConverter");

export class WheelRevConverter {
  private _convertedBeforeWheelRev = 0;
  private _convertedCurrentWheelRev = 0;
  private _baseTyreSize = 0;
  private _convertTyreSize = 0;
  private _convertFactor = 0;

  constructor(baseTyreSize: number, convertTyreSize: number) {
    this._baseTyreSize = baseTyreSize;
    this._convertTyreSize = convertTyreSize;
    this._convertFactor = convertTyreSize / baseTyreSize;
    debug(`Converter.Factor: ${this._convertFactor}`);
  }

  public convertWheelRev(currentMeasure: CSCMeasurement, beforeMeasure: CSCMeasurement): number {
    const convertedAddRev =
      (currentMeasure.cumulativeWheelRevolutions - beforeMeasure.cumulativeWheelRevolutions) / this._convertFactor;

    this._convertedBeforeWheelRev = this._convertedCurrentWheelRev;
    this._convertedCurrentWheelRev += convertedAddRev;

    debug(`BeforeMeasure.WheelRev: ${beforeMeasure.cumulativeWheelRevolutions}`);
    debug(`CurrentMeasure.WheelRev: ${currentMeasure.cumulativeWheelRevolutions}`);
    debug(`Converter.ConvertedBefore: ${this._convertedBeforeWheelRev}`);
    debug(`Converter.ConvertedCurrent: ${this._convertedCurrentWheelRev}`);
    debug(`Converter.AddRev: ${convertedAddRev}`);
    return this._convertedCurrentWheelRev;
  }
}
