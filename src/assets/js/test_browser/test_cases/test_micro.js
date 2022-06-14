/**
 * TestCase: test_micro
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

/**
 * Test micro case
 */
window.JitsiTestBrowser.test_micro = {

    /**
     * Run test
     *
     * @return {Promise<*>}
     */
    run: function () {
        return new Promise(res => {
            console.log("> Running test_micro");
            window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.PROCESSING, "context": "test_micro"});

            let utils = new WebRTCUtils();

            utils.getDefaultMediaCapture("audio", function (result) {
                window.JitsiTestBrowser.runner.resolve(res, {"status": "success", 'details': result}, "test_micro");

            }, function (error) {
                window.JitsiTestBrowser.runner.resolve(res, {"status": "fail", 'details': error}, "test_micro");
            });
        });
    }
}