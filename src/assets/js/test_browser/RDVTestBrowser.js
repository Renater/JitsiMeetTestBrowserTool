/**
 * TestCase: test_browser
 */

if (!window.hasOwnProperty('RDVTestBrowser'))
    window.RDVTestBrowser = {};

window.RDVTestBrowser.runner = {

    /**
     * Test status
     * TODO: use it!
     */
    status: 'idle',

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
                window.RDVTestBrowser.UI.swapPanes(templateName);

                // Run test
                window.RDVTestBrowser[templateName].run()
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
            const nbTestCases = window.RDVTestBrowser.runner.testCases.length;
            let cpt = 1;

            for (const templateName of window.RDVTestBrowser.runner.testCases) {
                await getPromise(templateName);
                await window.RDVTestBrowser.runner.wait();
                // Update progress
                document.querySelector(".progress").style.width = `${100*cpt/nbTestCases}%`;
                cpt++;
            }

            // Show final results
            window.RDVTestBrowser.UI.swapPanes('result_global');
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
    wait: function(delay){
        if (!delay) delay = 1000;
        return new Promise(r => setTimeout(r, delay))
    }
}