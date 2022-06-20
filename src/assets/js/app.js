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
    document.querySelectorAll(".menu-item, .menu-item-small").forEach(function (element){
        element.addEventListener("click", function() {
            document.querySelectorAll(".menu-item, .menu-item-small").forEach(function (element){
                element.classList.remove('is-active');
            });
            element.classList.add('is-active');
            window.JitsiTestBrowser.UI.swapPanes(this.getAttribute('data-pane'));

            // Hide menu for small only
            document.getElementById('menu-icon-small').click();
        });
    });

    // Listen to click on run alone test case
    document.querySelectorAll('[data-action="test-runner"]').forEach(function (element){
        element.addEventListener('click', function(){
            const testCase = element.getAttribute('data-test-case');
            window.JitsiTestBrowser.UI.blink(testCase, true);

            // Do nothing if disabled
            if (element.classList.contains('disabled')) return;

            window.JitsiTestBrowser[testCase].run()
                .then(function(result){
                    window.JitsiTestBrowser.UI.showResult(result, testCase);
                    window.JitsiTestBrowser.UI.blink(testCase, false);
                })
                .catch(function(reason){
                    echo(reason, testCase)
                    window.JitsiTestBrowser.UI.blink(testCase, false);
                });
        });
    });

    // Listen to click on stop on failures
    document.getElementById("stop_on_failures").addEventListener('click', function(element){
        window.JitsiTestBrowser.runner.stop_on_failures = this.checked === true;
    });



    // Listen to click on run all test
    document.getElementById('run_all').addEventListener('click', function(){
        this.setAttribute('disabled', 'disabled');

        window.JitsiTestBrowser.status = window.TestStatuses.PROCESSING;

        window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.PROCESSING});

        window.JitsiTestBrowser.runner.run();
    });

    // Listen to responsive menu button click
    document.getElementById('menu-icon-small').addEventListener('click', function(){
        let iconOpened = this.querySelector('div span.icon-opened');
        let iconClosed  = this.querySelector('div span.icon-closed');

        // Change icon
        if (this.getAttribute('data-opened') === "false"){
            this.setAttribute('data-opened', "true");
            iconOpened.classList.add('hide');
            iconClosed.classList.remove('hide');

        }else{
            this.setAttribute('data-opened', "false");
            iconOpened.classList.remove('hide');
            iconClosed.classList.add('hide');
        }

        // Show content
        document.getElementById('responsive-menu-content').classList.toggle('hide');
    });

    /**
     * Listen to "run" event
     * This function will temporarily disable run buttons for each test case
     */
    document.addEventListener('run', function(element){
        const status = element.status;
        switch (status){
            case window.TestStatuses.WAITING:
            case window.TestStatuses.ENDED:
                // All buttons available if not all processing
                if (!window.JitsiTestBrowser.runner.all_processing) {
                    document.querySelectorAll('[data-action="test-runner"]').forEach(function (element) {
                        element.classList.remove('disabled');
                        element.removeAttribute('title');
                    });
                }
                // Hide loader and show status result if needed
                if (element.context !== undefined){
                    window.JitsiTestBrowser.UI.showLoader(element.context, false);
                    window.JitsiTestBrowser.UI.showStatus(element.context, element.data.result, true);
                }

                break;
            case window.TestStatuses.PROCESSING:
                // No buttons available
                document.querySelectorAll('[data-action="test-runner"]').forEach(function (element){
                    element.classList.add('disabled');
                    element.setAttribute('title', window.lang.get('test_running'));
                });
                // Update loader if needed
                if (element.component !== undefined){
                    window.JitsiTestBrowser.UI.updateNetworkStatus(element.component, 'processing');
                }
                if (element.context !== undefined){
                    window.JitsiTestBrowser.UI.showStatus(element.context, false, false);
                    window.JitsiTestBrowser.UI.showLoader(element.context);
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
     * Listen to "network_stat" event
     * This function will temporarily disable run buttons for each test case
     */
    document.addEventListener('network_stat', function(element){
        if (element.data !==  undefined && element.context !== undefined){
            switch (element.context){
                case 'wss':
                case 'tcp':
                case 'udp':
                    if (element.data.status !== undefined) {
                        window.JitsiTestBrowser.UI.updateNetworkStatus(element.context, element.data.status);
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

                    }else if (element.data.ip_connected_to !== undefined){
                        // Got droppedFrames
                        document.querySelector(`div[data-content="ip_connected_to"]`)
                            .querySelector('span[data-content="value"]').innerHTML = element.data.ip_connected_to;
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