/**
 * TestCase: test_browser
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

/**
 * Global test runner
 *
 * @type {{wait: (function(*): Promise<*>), testCases: string[], run: Window.JitsiTestBrowser.runner.run}}
 */
window.JitsiTestBrowser.runner = {

    /**
     * List of test cases
     */
    testCases: [
        'test_browser', 'test_devices', 'test_camera', 'test_micro', 'test_network', 'test_room'
    ],

    run: function(){
        /**
         * Get promise to chain tests
         *
         * @param templateName
         * @return {Promise<unknown>}
         */
        function getPromise(templateName) {
            return new Promise(resolve => {
                // Show right panel
                window.JitsiTestBrowser.UI.swapPanes(templateName);

                // Run test
                window.JitsiTestBrowser[templateName].run()
                    .then(function (result) {
                        // Default show result
                        echo(result, templateName)
                        resolve();
                    })
                    .catch(function(reason){
                        echo(reason, templateName)
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
                await getPromise(templateName);
                await window.JitsiTestBrowser.runner.wait();
                // Update progress
                document.querySelector(".progress").style.width = `${100*cpt/nbTestCases}%`;
                cpt++;
            }

            // Show final results
            window.JitsiTestBrowser.UI.swapPanes('test_global');

            // Update status
            window.JitsiTestEvents.run.status = window.TestStatuses.ENDED;
            document.dispatchEvent(window.JitsiTestEvents.run);
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
    }
}