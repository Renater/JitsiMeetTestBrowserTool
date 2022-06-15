/**
 * TestCase: test_browser
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

/**
 * Global test runner
 */
window.JitsiTestBrowser.runner = {

    /**
     * True if processing all tests (not a single one)
     */
    all_processing: false,

    /**
     * True if force stop on failures
     */
    stop_on_failures: false,


    /**
     * Current process status
     */
    status: 0,


    /**
     * List of test cases
     */
    testCases: [
        'test_browser', 'test_devices', 'test_camera', 'test_micro', 'test_network', 'test_room'
    ],

    run: function(){
        this.all_processing = true;
        /**
         * Get promise to chain tests
         *
         * @param testCase
         * @return {Promise<unknown>}
         */
        function getPromise(testCase) {
            return new Promise(resolve => {
                // Show right panel
                window.JitsiTestBrowser.UI.swapPanes(testCase);

                // Run test
                window.JitsiTestBrowser[testCase].run()
                    .then(function (data) {
                        // Default show result
                        window.JitsiTestBrowser.UI.updateUI(data, testCase);

                        if (data.result === 'fail' && window.JitsiTestBrowser.runner.stop_on_failures){
                            window.JitsiTestBrowser.status = window.TestStatuses.STOPPED;
                        }

                        resolve();
                    })
                    .catch(function(reason){
                        echo(reason, testCase);
                    });
            })
        }
        /**
         * Async function run tests
         *
         * @return {Promise<void>}
         */
        async function runTests() {
            const nbTestCases = window.JitsiTestBrowser.runner.testCases.length;
            let cpt = 1;

            for (const templateName of window.JitsiTestBrowser.runner.testCases) {
                if (window.JitsiTestBrowser.runner.stop_on_failures && window.JitsiTestBrowser.status === window.TestStatuses.STOPPED){
                    // Stop on failures
                    return;
                }
                window.JitsiTestBrowser.UI.blink(templateName, true);
                await getPromise(templateName);
                await window.JitsiTestBrowser.runner.wait();
                window.JitsiTestBrowser.UI.blink(templateName, false);

                // Update progress
                document.querySelector(".progress").style.width = `${100*cpt/nbTestCases}%`;
                cpt++;

            }

            // Show final results
            window.JitsiTestBrowser.UI.swapPanes('test_global');

            window.JitsiTestBrowser.runner.all_processing = false;

            // Update status
            window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.ENDED});
        }

        runTests()
    },

    /**
     * Wait function
     *
     * @param delay Delay to wait
     *
     * @returns {Promise<unknown>}
     */
    wait: function(delay = 1000){
        return new Promise(r => setTimeout(r, delay))
    },


    /**
     * Final resolve function
     *
     * @param res
     * @param data
     */
    resolve: function(res, data, context){
        window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.ENDED, "context": context, "data" : data});
        res(data)
    }
}