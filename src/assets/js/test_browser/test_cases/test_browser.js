/**
 * TestCase: test_browser
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

/**
 * Test browser case
 *
 * @type {{run: (function(): Promise<unknown>)}}
 */
window.JitsiTestBrowser.test_browser = {

    /**
     * Run test
     *
     * @return {Promise<*>}
     */
    run: function () {
        return new Promise(resolve => {
            console.log("> Running test_browser");
            let utils = new WebRTCUtils();
            if (navigator.mediaDevices !== undefined && utils.isPeerConnectionSupported() && !utils.isBannedBrowser()) {
                resolve({"status": "success"});
            } else {
                resolve({"status": "fail"});
            }
        });
    }
}