/**
 * TestCase: test_browser
 */

if (!window.hasOwnProperty('RDVTestBrowser'))
    window.RDVTestBrowser = {};

/**
 * Test browser case
 *
 * @type {{swapPanes: Window.RDVTestBrowser.UI.swapPanes, updateUI: Window.RDVTestBrowser.UI.updateUI}}
 */
window.RDVTestBrowser.UI = {

    /**
     * Swap between right panes
     *
     * @param id ID of the pane to show
     * @param withMenu if true, also swap "is-active" class of left menu item
     */
    swapPanes: function(id, withMenu = true){
        console.log(`SWAP PANE [${id}]`);
        // Hide all
        document.querySelectorAll(".test-result").forEach(function (element){
            element.classList.add('hide');
        });
        // Show asked one
        const referer = document.getElementById(id).getAttribute('data-refer-to');
        document.getElementById(referer).classList.remove('hide')

        if (withMenu){
            document.querySelectorAll(".menu-item").forEach(function (element){
                element.classList.remove('is-active');
            });
            document.getElementById(id).classList.add('is-active');
        }
    },


    /**
     * Update UI according to result got from test (
     *
     * @param result
     * @param testCase
     */
    updateUI: function (result, testCase){
        const referer = document.getElementById(testCase).getAttribute('data-results');
        const children = document.getElementById(referer).children;

        for (let id = 0; id < children.length; id++) {
            let child = children[id];
            child.classList.add('hide');

            if (result.status === 'success' && child.getAttribute('data-result') === 'success') {
                child.classList.remove('hide');
            } else if (result.status === 'fail' && child.getAttribute('data-result') === 'fail') {
                child.classList.remove('hide');
            }
        }
    }
};