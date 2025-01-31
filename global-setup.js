
  // global-setup.js
  const { bsLocal, BS_LOCAL_ARGS } = require("./fixture");
  const { promisify } = require("util");
  const sleep = promisify(setTimeout);
  const redColour = "\x1b[31m";
  const whiteColour = "\x1b[0m";
 
  module.exports = async () => {
    if (process.env.BROWSERSTACK_LOCAL === "true") {
      console.log("Starting BrowserStackLocal ...");
      // Starts the Local instance with the required arguments
      let localResponseReceived = false;
 
      bsLocal.start(BS_LOCAL_ARGS, (err) => {
        if (err) {
          console.error(redColour + "Error starting BrowserStackLocal" + whiteColour);
        } else {
          console.log("BrowserStackLocal Started");
        }
        localResponseReceived = true;
      });
 
      while (!localResponseReceived) {
        await sleep(1000);
      }
    } else {
      console.log("Skipping BrowserStackLocal...");
    }
  };
