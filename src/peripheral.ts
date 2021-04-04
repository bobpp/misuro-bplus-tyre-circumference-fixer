import bleno from "@abandonware/bleno";
import { Constants } from "./Constants";
import { CSCService } from "./peripheral/CSCService";

const cscService = new CSCService();

bleno.on("accept", async (address: string) => {
  console.log(`Connected from ${address}`);
});

bleno.on("stateChange", async (state: string) => {
  if (state == "poweredOn") {
    bleno.startAdvertising(Constants.DEVICE_NAME, [cscService.uuid]);
  }
});

bleno.on("advertisingStart", async (err?: Error | null) => {
  if (!err) {
    bleno.setServices([cscService]);
  }
});

process.on("exit", () => {
  console.log("exit2");
  bleno.disconnect();
  bleno.stopAdvertising();
});
process.once("SIGINT", () => {
  process.exit();
});

// main loop
setInterval(async () => {
  true;
}, 500);
