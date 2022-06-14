/**
 * TestCase: test_browser
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

/**
 * Test browser case
 */
window.JitsiTestBrowser.test_browser = {

    /**
     * Run test
     *
     * @return {Promise<*>}
     */
    run: function () {
        return new Promise(res => {
            console.log("> Running test_browser");
            window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.PROCESSING, "context": "test_browser"});

            let utils = new WebRTCUtils();
            let status = "fail";

            if (navigator.mediaDevices !== undefined && utils.isPeerConnectionSupported() && !utils.isBannedBrowser()) {
                status = "success";
            }

            window.JitsiTestBrowser.runner.resolve(res, {"status": status}, "test_browser");
        });
    }
}