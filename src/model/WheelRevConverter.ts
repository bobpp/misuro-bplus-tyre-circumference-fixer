import Debug from "debug";
import { CSCMeasurement } from "./CSCMeasurement";
const debug = Debug("bobpp/model/WheelRevConverter");

export class WheelRevConverter {
  private _baseBeforeWheelRev = 0;
  private _baseCurrentWheelRev = 0;
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

  public convertWheelRev(currentMeasure: CSCMeasurement): number {
    this._baseBeforeWheelRev = this._baseCurrentWheelRev;
    this._baseCurrentWheelRev = currentMeasure.cumulativeWheelRevolutions;

    const convertedAddRev = (this._baseCurrentWheelRev - this._baseBeforeWheelRev) / this._convertFactor;
    this._convertedBeforeWheelRev = this._convertedCurrentWheelRev;
    this._convertedCurrentWheelRev += convertedAddRev;

    debug(`CurrentMeasure.WheelRev: ${currentMeasure.cumulativeWheelRevolutions}`);
    debug(`Converter.BaseBefore: ${this._baseBeforeWheelRev}`);
    debug(`Converter.BaseCurrent: ${this._baseCurrentWheelRev}`);
    debug(`Converter.ConvertedBefore: ${this._convertedBeforeWheelRev}`);
    debug(`Converter.ConvertedCurrent: ${this._convertedCurrentWheelRev}`);
    debug(`Converter.AddRev: ${convertedAddRev}`);
    return this._convertedCurrentWheelRev;
  }
}
