import Debug from "debug";
const debug = Debug("bobpp/model/CSCMeasurement");

export class CSCMeasurement {
  private _flags: number;
  private _cumulativeWheelRevolutions: number;
  private _lastWheelEventTime: number;
  private _cumulativeCrankRevolutions: number;
  private _lastCrankEventTime: number;

  static uint8ArrayLittleEndianToNumber(array: Uint8Array): number {
    let returnValue: number = array[0];
    for (let i = 1; i < array.length; i++) {
      returnValue += array[i] * Math.pow(256, i);
    }
    return returnValue;
  }

  static numberToLittleEndianUint8Array(num: number, length: number): Uint8Array {
    const littleEndianArray: Uint8Array = new Uint8Array(length);
    for (let i: number = length - 1; i >= 0; i--) {
      const x = Math.pow(256, i);
      littleEndianArray[i] = num / x;
      num = num % x;
    }
    return littleEndianArray;
  }

  static buildFromRawBinary(rawBinary: Uint8Array): CSCMeasurement {
    return new CSCMeasurement(
      rawBinary[0],
      CSCMeasurement.uint8ArrayLittleEndianToNumber(rawBinary.slice(1, 5)),
      CSCMeasurement.uint8ArrayLittleEndianToNumber(rawBinary.slice(5, 7)),
      CSCMeasurement.uint8ArrayLittleEndianToNumber(rawBinary.slice(7, 9)),
      CSCMeasurement.uint8ArrayLittleEndianToNumber(rawBinary.slice(9, 11))
    );
  }

  constructor(
    flags: number,
    cumulativeWheelRevolutions: number,
    lastWheelEventTime: number,
    cumulativeCrankRevolutions: number,
    lastCrankEventTime: number
  ) {
    this._flags = flags;
    this._cumulativeWheelRevolutions = cumulativeWheelRevolutions;
    this._lastWheelEventTime = lastWheelEventTime;
    this._cumulativeCrankRevolutions = cumulativeCrankRevolutions;
    this._lastCrankEventTime = lastCrankEventTime;
  }

  public values(): Array<number> {
    return [
      this._flags,
      this._cumulativeWheelRevolutions,
      this._lastWheelEventTime,
      this._cumulativeCrankRevolutions,
      this._lastCrankEventTime,
    ];
  }

  get flags(): number {
    return this._flags;
  }

  get cumulativeWheelRevolutions(): number {
    return this._cumulativeWheelRevolutions;
  }

  set cumulativeWheelRevolutions(rev: number) {
    this._cumulativeWheelRevolutions = rev;
  }

  get lastWheelEventTime(): number {
    return this._lastWheelEventTime;
  }

  get cumulativeCrankRevolutions(): number {
    return this._cumulativeCrankRevolutions;
  }

  get lastCrankEventTime(): number {
    return this._lastCrankEventTime;
  }

  /**
   * 現在の時速を返す
   *
   * @param before
   * @param tyrePerimeter タイヤの周長をメートル単位で記載
   * @returns km/h の時速を返却する
   */
  public calculateSpeed(before: CSCMeasurement, tyrePerimeter: number): number {
    const distance = (this._cumulativeWheelRevolutions - before.cumulativeWheelRevolutions) * tyrePerimeter;
    const time = ((currentLastWheelEventTime, beforeLastWheelEventTime) => {
      if (currentLastWheelEventTime == beforeLastWheelEventTime) {
        return 0;
      } else if (currentLastWheelEventTime > beforeLastWheelEventTime) {
        return (this._lastWheelEventTime - before.lastWheelEventTime) / 1024;
      } else {
        return (65536 - beforeLastWheelEventTime + currentLastWheelEventTime) / 1024;
      }
    })(this._lastWheelEventTime, before.lastWheelEventTime);

    const speed = ((distance / time) * 3600) / 1000 || 0;

    debug(`distance -> ${distance} m`);
    debug(`time -> ${time} sec`);
    debug(`speed -> ${speed} km/h`);
    return speed;
  }

  public toBinaryBuffer(): Buffer {
    const bufferArray: Uint8Array = new Uint8Array(11);
    bufferArray[0] = this._flags;
    const convertedCumulativeWheelRevolutions = CSCMeasurement.numberToLittleEndianUint8Array(
      this._cumulativeWheelRevolutions,
      4
    );
    for (let i = 0; i < 4; i++) {
      bufferArray[1 + i] = convertedCumulativeWheelRevolutions[i];
    }
    const convertedLastWheelEventTime = CSCMeasurement.numberToLittleEndianUint8Array(this._lastWheelEventTime, 2);
    for (let i = 0; i < 2; i++) {
      bufferArray[5 + i] = convertedLastWheelEventTime[i];
    }
    const convertedCumulativeCrankRevolutions = CSCMeasurement.numberToLittleEndianUint8Array(
      this._cumulativeCrankRevolutions,
      2
    );
    for (let i = 0; i < 2; i++) {
      bufferArray[7 + i] = convertedCumulativeCrankRevolutions[i];
    }
    const convertedLastCrankEventTime = CSCMeasurement.numberToLittleEndianUint8Array(this._lastCrankEventTime, 2);
    for (let i = 0; i < 2; i++) {
      bufferArray[9 + i] = convertedLastCrankEventTime[i];
    }

    return Buffer.from(bufferArray);
  }

  public isStopped(before: CSCMeasurement): boolean {
    return this._cumulativeWheelRevolutions == before.cumulativeWheelRevolutions;
  }
}
