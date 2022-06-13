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
            let utils = new WebRTCUtils();

            utils.getListDevices(function (result) {
                resolve({
                    "status": "success",
                    'details': result
                });
            }, function(error){
                resolve({
                    "status": "fail",
                    "details": error
                });
            });
        });
    }
}