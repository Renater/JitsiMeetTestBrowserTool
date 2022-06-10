/**
 * TestCase: test_micro
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

/**
 * Test micro case
 *
 * @type {{run: (function(*): Promise<unknown>)}}
 */
window.JitsiTestBrowser.test_micro = {

    /**
     * Run test
     *
     * @return {Promise<*>}
     */
    run: function () {
        return new Promise(callback => {
            console.log("> Running test_micro");

            let utils = new WebRTCUtils();

            utils.getDefaultMediaCapture("audio", function (result) {
                // TODO: Push statistics
                callback({
                    "status": "success",
                    'details': result
                });
            }, function(error){
                // TODO: Push statistics
                callback({
                    "status": "fail",
                    'details': error
                });
            });
        });
    }
}