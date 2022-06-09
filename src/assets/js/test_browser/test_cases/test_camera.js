/**
 * TestCase: test_camera
 */

if (!window.hasOwnProperty('RDVTestBrowser'))
    window.RDVTestBrowser = {};

/**
 * Test camera case
 *
 * @type {{run: (function(): Promise<unknown>)}}
 */
window.RDVTestBrowser.test_camera = {

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