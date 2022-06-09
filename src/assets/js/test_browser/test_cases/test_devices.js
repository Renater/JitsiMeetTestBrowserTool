/**
 * TestCase: test_devices
 */

if (!window.hasOwnProperty('RDVTestBrowser'))
    window.RDVTestBrowser = {};

/**
 * Test devices case
 *
 * @type {{run: (function(): Promise<unknown>)}}
 */
window.RDVTestBrowser.test_devices = {

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