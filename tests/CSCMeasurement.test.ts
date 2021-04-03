import { CSCMeasurement } from "../src/model/CSCMeasurement"

describe('CSCMeasurement', (): void => {
  test('Parse', (): void => {
    const target = CSCMeasurement.buildFromRawBinary(new Uint8Array([3, 2, 1, 0, 0, 16, 119, 5, 0, 144, 103])).values()
    expect(target[0]).toEqual(3)
    expect(target[1]).toEqual(258)
    expect(target[2]).toEqual(30480)
    expect(target[3]).toEqual(5)
    expect(target[4]).toEqual(26512)
  });

  test('toBinaryBuffer', (): void => {
    const target = CSCMeasurement.buildFromRawBinary(new Uint8Array([3, 2, 1, 0, 0, 16, 119, 5, 0, 144, 103])).toBinaryBuffer()
    expect(target).toEqual(Buffer.from([3, 2, 1, 0, 0, 16, 119, 5, 0, 144, 103]))
  })
})
