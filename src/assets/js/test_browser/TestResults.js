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
     * Show test camera results
     *
     * @param data
     */
    test_camera: function(data){
        let container = document.getElementById('camera_results');

        if (data.result === 'success' && data.details){
            // Success
            let sub = container.querySelector('div[data-result="success"]')
            sub.classList.remove('hide');

            // Remove default
            container.querySelector('div[data-result="default"]')
                .classList.add('hide');

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

    },


    /**
     * Default rendering function
     *
     * @param data
     */
    defaultRendering: function (testCase, data) {
        // Default result showing
        const referer = document.getElementById(testCase).getAttribute('data-results');
        const children = document.getElementById(referer).children;

        for (let id = 0; id < children.length; id++) {
            let child = children[id];
            child.classList.add('hide');

            if (data.result === 'success' && child.getAttribute('data-result') === 'success') {
                child.classList.remove('hide');
            } else if (data.result === 'fail' && child.getAttribute('data-result') === 'fail') {
                child.classList.remove('hide');
            }
        }
    }
}