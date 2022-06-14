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
            window.JitsiTestBrowser.UI.swapPanes(this.id);
        });
    });

    // Listen to click on run alone test case
    document.querySelectorAll('[data-action="test-runner"]').forEach(function (element){
        element.addEventListener('click', function(){
            const testCase = element.getAttribute('data-test-case');

            // Do nothing if disabled
            if (element.classList.contains('disabled')) return;

            window.JitsiTestBrowser[testCase].run()
                .then(function(result){
                    window.JitsiTestBrowser.UI.updateUI(result, testCase);
                })
                .catch(function(reason){
                    echo(reason, testCase)
                });
        });
    });


    // Listen to click on run all test
    document.getElementById('run_all').addEventListener('click', function(){
        this.setAttribute('disabled', 'disabled');

        window.JitsiTestEvents.run.status = window.TestStatuses.PROCESSING;
        document.dispatchEvent(window.JitsiTestEvents.run);

        window.JitsiTestBrowser.runner.run();
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
                // Update loader if needed
                if (element.component !== undefined){
                    let res = document.createElement('i');
                    res.classList.add('fas');
                    res.classList.add('fa-spinner');
                    res.classList.add('fa-spin');

                    document.getElementById(`media_connectivity_${element.component}`)
                        .querySelector('span[data-content="value"]').append(res);
                }
                break;
            case window.TestStatuses.PAUSED:
            case window.TestStatuses.STOPPED:
                // TODO
                break;

            default:
                console.error(`Unknown status: ${status}`);
        }
    });

    /**
     * Listen to "run_event" event
     * This function will temporarily disable run buttons for each test case
     */
    document.addEventListener('network_stat', function(element){
        console.log('GOT NETWORK STAT');
        console.log(element.data);
        if (element.data !==  undefined && element.context !== undefined){
            switch (element.context){
                case 'wss':
                case 'tcp':
                case 'udp':
                    if (element.data.status !== undefined) {
                        let res = document.createElement('i');
                        res.classList.add('fa-solid');
                        res.classList.add(element.data.status === "success" ? 'fa-check' : 'fa-circle-exclamation');

                        let selector = document.getElementById(`media_connectivity_${element.context}`);
                        let subItem = selector.querySelector('span[data-content="value"]')
                        subItem.innerHTML = '';
                        subItem.append(res);

                        selector.classList.add(element.data.status === "success" ? 'test-success' : 'test-fail');
                    }
                    if (element.data.framesPerSecond !== undefined){
                        // Got a framerate
                        document.getElementById(`media_connectivity_framerate`)
                            .querySelector('span[data-content="value"]').innerHTML = element.data.framesPerSecond;

                    }else if (element.data.bitrate !== undefined){
                        // Got a bitrate
                        document.getElementById(`media_connectivity_bitrate`)
                            .querySelector('span[data-sub="bitrate"] span[data-content="value"]').innerHTML = element.data.bitrate+' kbit/s';

                    }else if (element.data.average_bitrate !== undefined){
                        // Got a bitrate
                        document.getElementById(`media_connectivity_bitrate`)
                            .querySelector('span[data-sub="average_bitrate"] span[data-content="value"]').innerHTML = `${element.data.average_bitrate} kbit/s`;

                    }else if (element.data.packetLost !== undefined){
                        // Got droppedFrames
                        document.getElementById(`media_connectivity_packetlost`)
                            .querySelector('span[data-content="value"]').innerHTML = element.data.packetLost;

                    }else if (element.data.jitter !== undefined){
                        // Got droppedFrames
                        document.getElementById(`media_connectivity_jitter`)
                            .querySelector('span[data-content="value"]').innerHTML = element.data.jitter;
                    }

                    break;


                case 'video_player':
                    if (element.data.local !== undefined) {
                        // Local video dimensions
                        document.getElementById(`video_container`)
                            .querySelector('section[data-content="local_stats"] div[data-content="video_dimensions"] span[data-content="value"]')
                                .innerHTML = `${element.data.local.video_dimension.width}x${element.data.local.video_dimension.height} px`;
                    }else{
                        // Remote video dimensions
                        document.getElementById(`video_container`)
                            .querySelector('section[data-content="remote_stats"] div[data-content="video_dimensions"] span[data-content="value"]')
                            .innerHTML = `${element.data.remote.video_dimension.width}x${element.data.remote.video_dimension.height} px`;
                    }

                    break;

            }
        }


    });

};