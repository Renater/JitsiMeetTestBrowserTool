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
        return new Promise(res => {
            console.log("> Running test_camera");
            window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.PROCESSING, "context": "test_camera"});

            let utils = new WebRTCUtils();

            utils.getDefaultMediaCapture("video", function (result) {
                window.JitsiTestBrowser.runner.resolve(res, {
                    "status": "success",
                    'details': result
                }, "test_camera")
            }, function(error){
                window.JitsiTestBrowser.runner.resolve(res, {
                    "status": "fail",
                    'details': error
                }, "test_camera")
            });
        });
    }
}