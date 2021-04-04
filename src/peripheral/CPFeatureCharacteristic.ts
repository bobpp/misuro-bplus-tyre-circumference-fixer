import bleno from "@abandonware/bleno";
import { Constants } from "../Constants";

export class CPFeatureCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: Constants.CP_CHARACTERISTICS.CP_FEATURE_UUID,
      properties: ["read"],
      value: Buffer.from([12, 0, 0]),
    });
  }
}
