/**
 * TestCase: test_browser
 */

if (!window.hasOwnProperty('RDVTestBrowser'))
    window.RDVTestBrowser = {};

/**
 * Test browser case
 *
 * @type {{run: (function(): Promise<unknown>)}}
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
}