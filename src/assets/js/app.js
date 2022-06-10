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
    document.querySelectorAll(".test-case").forEach(function (element){
        element.addEventListener("click", function() {
            document.querySelectorAll(".test-case").forEach(function (element){
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
            console.log('====>'+testCase);

            window.RDVTestBrowser[testCase].run()
                .then(function(result){
                    echo(result, testCase)
                })
                .catch(function(reason){
                    echo(reason, testCase)
                });
        });
    });


    // Listen to click on run all test
    document.getElementById('run_all').addEventListener('click', function(){
        this.setAttribute('disabled', 'disabled');

        window.RDVTestBrowser.runner.run()
    });
};