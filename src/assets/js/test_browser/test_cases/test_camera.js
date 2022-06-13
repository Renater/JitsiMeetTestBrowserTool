/**
 * TestCase: test_camera
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

/**
 * Test camera case
 */
window.JitsiTestBrowser.test_camera = {

    /**
     * Run test
     *
     * @return {Promise<*>}
     */
    run: function () {
        return new Promise(resolve => {
            console.log("> Running test_camera");
            let utils = new WebRTCUtils();

            utils.getDefaultMediaCapture("video", function (result) {
                resolve({
                    "status": "success",
                    'details': result
                })
            }, function(error){
                resolve({
                    "status": "fail",
                    'details': error
                })
            });
        });
    }
}