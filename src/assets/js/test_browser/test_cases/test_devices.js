/**
 * TestCase: test_devices
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

/**
 * Test devices case
 */
window.JitsiTestBrowser.test_devices = {

    /**
     * Run test
     *
     * @return {Promise<*>}
     */
    run: function () {
        return new Promise(resolve => {
            console.log("> Running test_devices");
            window.JitsiTestEvents.dispatch('run', {
                "status": window.TestStatuses.PROCESSING,
                "context": "test_devices"
            });

            let utils = new WebRTCUtils();

            utils.getListDevices(function (result) {
                window.JitsiTestBrowser.runner.resolve(resolve, {"status": "success", 'details': result}, "test_devices");

            }, function (error) {
                window.JitsiTestBrowser.runner.resolve(resolve, {"status": "fail", 'details': error}, "test_devices");
            });
        });
    }
}