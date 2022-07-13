/**
 * Show test result
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

/**
 * Show test result
 */
window.JitsiTestBrowser.TestResults = {


    /**
     * List of test cases which did not passed
     */
    testsOnError: [],

    /**
     * Show test devices results
     *
     * @param data
     */
    test_devices: function(data){
        let container = document.getElementById('devices_results');

        if (data.result === 'success' && data.details){
            // Success
            let sub = container.querySelector('div[data-result="success"]')
            sub.classList.remove('hide');

            // Remove default
            container.querySelector('div[data-result="default"]')
                .classList.add('hide');

            ['audioinput', 'audiooutput', 'videoinput'].forEach(function (element){
                if (data.details.hasOwnProperty(element)) {
                    let elementContainer = sub.querySelector(`div[data-result="${element}"] > div[data-result="content"]`);
                    elementContainer.innerHTML = '';
                    let component = document.createElement('div');
                    component.innerHTML = data.details[element].join('<br />');
                    elementContainer.append(component);
                }
            });

        }else{
            // Fail
            let sub = container.querySelector('div[data-result="fail"]')
            sub.classList.remove('hide');
        }
    },


    /**
     * Show final results
     */
    test_global: function() {
        let container = document.getElementById('global_results');

        // Remove default
        container.querySelector('div[data-result="default"]')
            .classList.add('hide');

        if (window.JitsiTestBrowser.TestResults.testsOnError.length > 0){
            // Got errors
            let sub = container.querySelector('div[data-result="fail"]')
            sub.classList.remove('hide');

            // Show test failed

            window.JitsiTestBrowser.TestResults.testsOnError.forEach(testCase => {
                sub.querySelector(`[data-test-case="${testCase}"]`).classList.remove('hide');
            })
        }else{
            // All test passed successfully
            let sub = container.querySelector('div[data-result="success"]')
            sub.classList.remove('hide');
        }

        // Show action buttons
        container.querySelector('div[data-content="action_buttons"]').classList.remove('hide');
    },


    /**
     * Default rendering function
     *
     * @param testCase
     * @param data
     */
    defaultRendering: function (testCase, data) {
        let container = document.getElementById(document.getElementById(testCase).getAttribute('data-results'));

        // Remove default
        container.querySelector('div[data-result="default"]')
            .classList.add('hide');

        if (data.result === 'success'){
            // Success
            let sub = container.querySelector('div[data-result="success"]')
            sub.classList.remove('hide');

            // Show result title
            sub.querySelector('div[data-result="title"]')
                .classList.remove('hide');

            if (data.details){
                sub.querySelector('div[data-result="data"]')
                    .append(data.details)
            }

        }else{
            // Fail
            let sub = container.querySelector('div[data-result="fail"]')
            sub.classList.remove('hide');
        }

        container.scrollIntoView({ behavior: 'smooth', block: 'end'})
    }
}