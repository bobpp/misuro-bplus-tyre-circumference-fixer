import bleno from "@abandonware/bleno";
import { Constants } from "../Constants";

export class CSCFeatureCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: Constants.CSC_CHARACTERISTICS.CSC_FEATURE_UUID,
      properties: ["read"],
      value: Buffer.from([3, 0]),
    });
  }
}
