/**
 * TestCase: test_browser
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

/**
 * Test browser case
 *
 * @type {{swapPanes: Window.JitsiTestBrowser.UI.swapPanes, showResult: Window.JitsiTestBrowser.UI.showResult}}
 */
window.JitsiTestBrowser.UI = {

    /**
     * Custom test result function for
     */
    handleResults: {
        'test_devices': function (data){
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
        }
    },

    /**
     * Swap between right panes
     *
     * @param id ID of the pane to show
     * @param withMenu if true, also swap "is-active" class of left menu item
     */
    swapPanes: function(id, withMenu = true){
        // Hide all
        document.querySelectorAll(".test-result").forEach(function (element){
            element.classList.add('hide');
        });
        // Show asked one
        const referer = document.getElementById(id).getAttribute('data-refer-to');
        document.getElementById(referer).classList.remove('hide')

        if (withMenu){
            document.querySelectorAll(".menu-item, .menu-item-small").forEach(function (element){
                element.classList.remove('is-active');
            });
            document.querySelectorAll(`[data-pane="${id}"]`).forEach(function(element){
                element.classList.add('is-active');
            });
        }
    },


    /**
     * Update UI according to result got from test (
     *
     * @param result
     * @param testCase
     */
    showResult: function (data, testCase){
        if (window.JitsiTestBrowser.TestResults.hasOwnProperty(testCase)){
            // Specific handling for this result
            window.JitsiTestBrowser.TestResults[testCase](data);

        }else {
            window.JitsiTestBrowser.TestResults.defaultRendering(testCase, data);
        }
    },


    /**
     * Show specific loader
     *
     * @param context
     * @param show
     */
    showLoader: function(context, show = true){
        let container = document.querySelector(`div.result-status[data-context="${context}"] > i[data-loader]`);
        container.classList = '';
        container.classList.add('fas', 'fa-spinner', 'fa-spin');

        if (!show){
            container.classList.add('hide')
        }
    },


    /**
     * Show specific test status
     *
     * @param context
     * @param show
     */
    showStatus: function(context, status = false, show = true){
        let container = document.querySelector(`div.result-status[data-context="${context}"] > i[data-loader]`);
        container.classList = '';
        container.classList.add('fa-solid', 'fa-arrow-right-long');


        let sub = document.querySelector(`div.result-status[data-context="${context}"] > span`);
        if (show){
            sub.classList.remove('hide');
        }else{
            sub.classList.add('hide');
        }

        // Show status
        if (status !== false) {
            let statusContainer = sub.querySelector(`span[data-status="${status === "success" ? "OK" : "KO"}"]`);
            statusContainer.classList.remove('hide');
        }
    },

    /**
     * Blink identfied element
     *
     * @param id
     * @param blink
     */
    blink: function(id, blink){
        let element = document.getElementById(id);
        if (blink) {
            element.classList.add('blink');
        }else{
            element.classList.remove('blink');
        }
    },


    /**
     * Update network test status
     *
     * @param networkComponent
     * @param status
     */
    updateNetworkStatus: function(networkComponent, status){
        let container = document.getElementById(`media_connectivity_${networkComponent}`);
        let sub = container.querySelector('span[data-content="status_icon"]');
        let icon = sub.querySelector('i');

        container.classList.remove('test-success', 'test-fail');
        sub.classList.remove('hide');
        icon.classList = '';

        switch (status){
            case 'success':
                icon.classList.add('fa-solid', 'fa-check');
                container.classList.add('test-success');

                break;

            case 'fail':
                icon.classList.add('fa-solid', 'fa-circle-exclamation');
                container.classList.add('test-fail');
                break;

            case 'processing':
                icon.classList.add('fas', 'fa-spinner', 'fa-spin');
                break;

            default:
                console.error(`Unknown status: ${status}`)
        }
    }
}