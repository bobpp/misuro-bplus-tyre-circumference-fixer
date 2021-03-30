const debug = require('debug')('bobpp/CSCMeasurement')

export class CSCMeasurement {
  private _flags: number
  private _cumulativeWheelRevolutions: number
  private _lastWheelEventTime: number
  private _cumulativeCrankRevolutions: number
  private _lastCrankEventTime: number

  constructor (rawBinary: Uint8Array) {
    const uint8ArrayLittleEndianToNumber = function(array: Uint8Array): number {
      let returnValue: number = array[0]
      for (let i: number = 1; i < array.length; i++) {
        returnValue += array[i] * Math.pow(256, i)
      }
      return returnValue
    }

    this._flags = rawBinary[0]
    this._cumulativeWheelRevolutions = uint8ArrayLittleEndianToNumber(rawBinary.slice(1, 5))
    this._lastWheelEventTime = uint8ArrayLittleEndianToNumber(rawBinary.slice(5, 7))
    this._cumulativeCrankRevolutions = uint8ArrayLittleEndianToNumber(rawBinary.slice(7, 9))
    this._lastCrankEventTime = uint8ArrayLittleEndianToNumber(rawBinary.slice(9, 11))
  }

  public values(): Array<number> {
    return [
      this._flags,
      this._cumulativeWheelRevolutions,
      this._lastWheelEventTime,
      this._cumulativeCrankRevolutions,
      this._lastCrankEventTime,
    ]
  }

  get flags (): number {
    return this._flags
  }

  get cumulativeWheelRevolutions(): number {
    return this._cumulativeWheelRevolutions
  }

  get lastWheelEventTime(): number {
    return this._lastWheelEventTime
  }

  get cumulativeCrankRevolutions(): number {
    return this._cumulativeCrankRevolutions
  }

  get lastCrankEventTime(): number {
    return this._lastCrankEventTime
  }

  /**
   * 現在の時速を返す
   *
   * @param before
   * @param tyrePerimeter タイヤの周長をメートル単位で記載
   * @returns km/h の時速を返却する
   */
  public calculateSpeed(before: CSCMeasurement, tyrePerimeter: number): number {
    const distance = (this._cumulativeWheelRevolutions - before.cumulativeWheelRevolutions) * tyrePerimeter
    const time = ((currentLastWheelEventTime, beforeLastWheelEventTime) => {
      if (currentLastWheelEventTime == beforeLastWheelEventTime) {
        return 0
      }
      else if (currentLastWheelEventTime > beforeLastWheelEventTime) {
        return (this._lastWheelEventTime - before.lastWheelEventTime) / 1024
      }
      else {
        return ((65536 - beforeLastWheelEventTime) + currentLastWheelEventTime) / 1024
      }
    })(this._lastWheelEventTime, before.lastWheelEventTime);

    const speed = distance / time * 3600 / 1000 || 0

    debug(`distance -> ${distance} m`)
    debug(`time -> ${time} sec`)
    debug(`speed -> ${speed} km/h`)
    return speed
  }
}
