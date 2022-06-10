/**
 * Basic function used to show test results on UI
 * TODO: refactor this function by anything better
 *
 * @param result
 * @param id
 */
function echo(result, id){
    console.log('%o', result)
    let res = document.createElement('div');
    res.append(JSON.stringify(result));


    let referer = document.getElementById(id).getAttribute('data-refer-to');
    document.getElementById(referer).append(res);
}


window.onload = function() {
    // Listen click on item (left menu)
    document.querySelectorAll(".menu-item").forEach(function (element){
        element.addEventListener("click", function() {
            document.querySelectorAll(".menu-item").forEach(function (element){
                element.classList.remove('is-active');
            });
            element.classList.add('is-active');
            window.RDVTestBrowser.UI.swapPanes(this.id);
        });
    });

    // Listen to click on run alone test case
    document.querySelectorAll('[data-action="test-runner"]').forEach(function (element){
        element.addEventListener('click', function(){
            const testCase = element.getAttribute('data-test-case');

            // Do nothing if disabled
            if (element.classList.contains('disabled')) return;

            window.RDVTestBrowser[testCase].run()
                .then(function(result){
                    window.RDVTestBrowser.UI.updateUI(result, testCase);
                    // echo(result, testCase)
                })
                .catch(function(reason){
                    echo(reason, testCase)
                });
        });
    });


    // Listen to click on run all test
    document.getElementById('run_all').addEventListener('click', function(){
        this.setAttribute('disabled', 'disabled');

        window.RDVTestEvents.run.status = window.TestStatuses.PROCESSING;
        document.dispatchEvent(window.RDVTestEvents.run);

        window.RDVTestBrowser.runner.run();
    });

    /**
     * Listen to "run_event" event
     * This function will temporarily disable run buttons for each test case
     */
    document.addEventListener('run_event', function(element){
        const status = element.status;
        switch (status){
            case window.TestStatuses.WAITING:
            case window.TestStatuses.ENDED:
                // All buttons available
                document.querySelectorAll('[data-action="test-runner"]').forEach(function (element){
                    element.classList.remove('disabled');
                    element.removeAttribute('title');
                });

                break;
            case window.TestStatuses.PROCESSING:
                // No buttons available
                document.querySelectorAll('[data-action="test-runner"]').forEach(function (element){
                    element.classList.add('disabled');
                    element.setAttribute('title', window.lang.get('test_running'));
                });
                break;
            case window.TestStatuses.PAUSED:
            case window.TestStatuses.STOPPED:
                // TODO
                break;

            default:
                console.error(`Unknown status: ${status}`);
        }
    });

};