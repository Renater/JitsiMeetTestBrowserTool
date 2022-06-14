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
        return new Promise(resolve => {
            console.log("> Running test_browser");
            window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.PROCESSING});

            let utils = new WebRTCUtils();
            if (navigator.mediaDevices !== undefined && utils.isPeerConnectionSupported() && !utils.isBannedBrowser()) {
                window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.ENDED});
                resolve({"status": "success"});
            } else {
                window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.ENDED});
                resolve({"status": "fail"});
            }
        });
    }
}