
    // lamdatest-setup.js
    const base = require("@playwright/test");
    const path = require("path");
    const { chromium } = require("playwright");
 
    // LambdaTest capabilities
    const capabilities = {
        browserName: "Chrome",
        browserVersion: "latest",
        "LT:Options": {
            platform: "Windows 10",
            build: "Playwright TS Build",
            name: "Playwright Test",
            user: " ",
            accessKey: "  ",
            network: true,
            video: true,
            console: true,
            tunnel: false,
            tunnelName: "",
            geoLocation: "",
        },
    };
 
    // Patching the capabilities dynamically according to the project name.
    const modifyCapabilities = (configName, testName) => {
        let config = configName.split("@lambdatest")[0];
        let [browserName, browserVersion, platform] = config.split(":");
        capabilities.browserName = browserName ? browserName : capabilities.browserName;
        capabilities.browserVersion = browserVersion ? browserVersion : capabilities.browserVersion;
        capabilities["LT:Options"]["platform"] = platform ? platform : capabilities["LT:Options"]["platform"];
        capabilities["LT:Options"]["name"] = testName;
    };
 
    const test = base.test.extend({
        page: async ({ page, playwright }, use, testInfo) => {
            let fileName = testInfo.file.split(path.sep).pop();
            if (testInfo.project.name.match(/lambdatest/)) {
                modifyCapabilities(testInfo.project.name, `${testInfo.title} - ${fileName}`);
 
                const browser = await chromium.connect({
                    wsEndpoint: `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(JSON.stringify(capabilities))}`,
                });
 
                const ltPage = await browser.newPage(testInfo.project.use);
                await use(ltPage);
 
                const testStatus = {
                    action: "setTestStatus",
                    arguments: {
                        status: testInfo.status,
                        remark: testInfo.error?.stack || testInfo.error?.message,
                    },
                };
                await ltPage.evaluate(() => {}, `lambdatest_action: ${JSON.stringify(testStatus)}`);
                await ltPage.close();
                await browser.close();
            } else {
                await use(page);
            }
        },
    });
 
    module.exports = test;
    