export class Constants {
  static readonly DEVICE_NAME = "bobpp";
  static readonly CSC_SERVICE_UUID = "1816";
  static readonly CSC_CHARACTERISTICS = {
    CSC_MEASUREMENT_UUID: "2A5B",
    CSC_FEATURE_UUID: "2A5C",
  };
  static readonly CP_SERVICE_UUID = "1818";
  static readonly CP_CHARACTERISTICS = {
    CP_MEASUREMENT_UUID: "2A63",
    CP_FEATURE_UUID: "2A65",
  };
  static readonly CLIENT_CHARACTERISTIC_CONFIGURATION = "2902";
  static readonly MISURO_BPLUS_TYRE_LENGTH = 0.08;
  static readonly CONVERT_TYRE_LENGTH = 0.3;
}
