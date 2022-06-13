/**
 * TestCase: test_room
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};


/**
 * Test room access case
 */
window.JitsiTestBrowser.test_room = {
    /**
     * Use to set player lang
     */
    lang: {
        local: undefined,
        stored: undefined,
    },

    /**
     * Interval to wait before ensuring user connection to the room
     */
    testInterval: undefined,

    /**
     * Interval to show seconds remaining
     */
    timerInterval: undefined,

    /**
     * Test room seconds remaining
     */
    secondsRemaining: 30,

    /**
     * Room name
     */
    roomName: undefined,

    /**
     * Room token
     */
    roomToken: undefined,

    /**
     * Domain URL
     */
    domain_url: undefined,

    /**
     * Domain
     */
    domain: undefined,

    /**
     * Main API Client
     */
    mainApiClient: undefined,

    /**
     * Second API client
     */
    secondApiClient: undefined,

    /**
     * Main node player
     */
    mainNodePlayer: undefined,

    /**
     * Second node player
     */
    secondNodePlayer: undefined,

    /**
     * Run test
     *
     * @return {Promise<*>}
     */
    run: function () {
        return new Promise(resolve => {
            console.log("> Running test_room");

            let context = window.JitsiTestBrowser.test_room;
            context.status = "pending"

            /**
             * If there is an error processing test room, display it, close connections
             * if needed, then resolve with "error" status
             *
             * @param reason
             */
            let onError = function (reason) {
                context.onError(reason);
                context.closeConnections();
                resolve({
                    "status": "fail"
                });
            };


            // init room name & room token
            context.getRoomName()
                .then(function () {
                    context.getRoomToken()
                        .then(function (){
                            // Init test room
                            context.initTestRoom().then(function () {
                                // Connect clients
                                context.connectClients().then(function () {
                                    // Add listeners to clients
                                    context.addListeners().then(function () {
                                        // Start interval
                                        context.testInterval = setTimeout(function () {
                                            // Test user connection to the room after 30 seconds
                                            context.testRoomConnection(function (result) {
                                                // Success, close connections, display results
                                                // and resolve with "success" status
                                                context.closeConnections();
                                                context.onSuccess(result);
                                                resolve(result);
                                            }, onError)
                                        }, 20000);

                                        // Show timer
                                        context.timerInterval = setInterval(function(){
                                            context.secondsRemaining--;
                                            if (context.secondsRemaining < 0){
                                                clearInterval(context.timerInterval);
                                            }

                                        }, 1000)
                                    }).catch(reason => {
                                        onError(reason);
                                    });
                                }).catch(reason => {
                                    onError(reason);
                                });
                            }).catch(reason => {
                                onError(reason);
                            });
                        }).catch(reason => {
                            onError(reason);
                        });
                    }).catch(reason => {
                        onError(reason);
                    })
                })

    },


    /**
     * Get room name
     *
     * @returns {Promise<*>}
     */
    getRoomName: function(){
        return new Promise((resolve, reject) => {

            let appUrl = document.getElementById('main').getAttribute('data-application-url');
            let context = window.JitsiTestBrowser.test_room;

            let settings = {
                method: 'get',
                headers: new Headers({'content-type': 'text/plain'}),
            };

            // TODO: find a way to make it work without this call
            fetch(`${appUrl}/home/rest.php/TestBrowser/RoomName`, settings)

                .then(response => {
                    response.text()
                        .then(function (data) {
                            context.roomName = data;
                            resolve();
                        })
                        .catch(reason => {
                            reject({"status": "fail", "error": reason.toString()});
                        });
                    }
                )
        });
    },


    /**
     * Get room token
     *
     * @returns {Promise<*>}
     */
    getRoomToken: function() {
        return new Promise((resolve, reject) => {
            let appUrl = document.getElementById('main').getAttribute('data-application-url');
            let context = window.JitsiTestBrowser.test_room;

            let settings = {
                method: 'get'
            };

            // TODO: find a way to make it work without this call
            fetch(`${appUrl}/home/rest.php/TestBrowser/RoomToken?` + new URLSearchParams(
                {
                    RoomName: context.roomName
                }
            ), settings)
                .then(response => {
                    response.text()
                        .then(function (data) {
                            context.roomToken = decodeURIComponent(data);
                            resolve();
                        })
                        .catch(reason => {
                            reject({"status": "fail", "error": reason.toString()});
                        });
                    }
                )
        });
    },

    /**
     * Add listener for api client.
     *
     * Listeners used:
     *      participantJoined: when a participant join the call
     *      videoConferenceLeft: when participants left the call
     *
     * @return {Promise<unknown>}
     */
    addListeners: function () {
        return new Promise((resolve) => {
            let context = window.JitsiTestBrowser.test_room;

            context.mainApiClient.addEventListener("participantJoined", function () {
                let context = window.JitsiTestBrowser.test_room;
                context.mainApiClient.removeEventListener("participantJoined");
            });

            context.mainApiClient.addEventListener("videoConferenceLeft", function () {
                context.mainApiClient.removeEventListener("videoConferenceLeft");

                // Close connections on participant left
                // TODO: is it usefull anymore?
                context.closeConnections();
            });
            resolve();
        });
    },


    /**
     * Init test room
     *
     * @return {Promise<unknown>}
     */
    initTestRoom: function () {
        return new Promise((resolve, reject) => {
            console.log('[test_room]: Init test room...');

            let context = window.JitsiTestBrowser.test_room;

            // Set lang into local storage to force translation into jitsi test room
            context.lang.local = document.querySelector('html').getAttribute('lang');
            context.lang.stored = localStorage.getItem('language');
            localStorage.removeItem('language');
            localStorage.setItem('language', context.lang.local);

            if (context.mainApiClient)
                context.mainApiClient.dispose();
            if (context.secondApiClient)
                context.secondApiClient.dispose();

            // Init domain
            context.domain = document.getElementById('main').getAttribute('data-application-url');
            context.domain_url = context.domain +'/home';


            // Init nodes
            context.mainNodePlayer = document.getElementById('main_player');
            context.secondNodePlayer = document.getElementById('second_player');

            /**
             * Get session ID using the Room endpoint
             */
            let appUrl = context.domain_url;

            let settings = {
                method: 'get'
            };

            // TODO: find a way to make it work without this call
            fetch(`${appUrl}/rest.php/Room?`+ new URLSearchParams(
                {
                    roomName: context.roomName,
                    domain: context.domain,
                    token: context.roomToken,
                }
            ), settings)
                .then(response => {
                    response.json()
                        .then(function (data) {
                            console.log('[test_room]: OK');
                            if (data.status === 'success') {
                                console.log('[test_room]: Test room initialized.');
                                resolve();
                            } else {
                                reject(data);
                            }
                        })
                        .catch(reason => {
                            reject({"status": "fail", "error": reason.toString()});
                        });
                    }
                )
        });
    },


    /**
     * Connect API clients to the call
     *
     * @return {Promise<unknown>}
     */
    connectClients: function () {
        return new Promise((resolve) => {
            let context = window.JitsiTestBrowser.test_room;
            console.log('[test_room]: Connect clients...');

            let mainOptions = {
                roomName: context.roomName,
                width: context.mainNodePlayer.width,
                height: context.mainNodePlayer.height,
                interfaceConfigOverwrite: {
                    CLOSE_PAGE_GUEST_HINT: true
                },
                configOverwrite: {
                    callStatsID: '',
                    defaultLanguage: context.lang.local,
                    enablePopupExternalAuth: true,
                    startWithAudioMuted: true,
                    startWithVideoMuted: true,
                    p2p: {enabled: false},
                    desktopSharingChromeDisabled: true
                },
                parentNode: context.mainNodePlayer
            }

            let secondOptions = {
                roomName: context.roomName,
                width: context.secondNodePlayer.width,
                height: context.secondNodePlayer.height,
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: ['microphone', 'camera', 'settings', 'hangup'],
                    MAIN_TOOLBAR_BUTTONS: [],
                    INITIAL_TOOLBAR_TIMEOUT: 0
                },
                configOverwrite: {
                    callStatsID: '',
                    enablePopupExternalAuth: true,
                    p2p: {enabled: false}
                },
                parentNode: context.secondNodePlayer
            }

            // Connect main client
            let subDomain = context.domain.replace(/^https?:\/\//, '');
            context.mainApiClient = new JitsiMeetExternalAPI(subDomain, mainOptions);

            // Tricks to get media, connect another (same) client one second later
            setTimeout(function () {
                context.secondApiClient = new JitsiMeetExternalAPI(subDomain, secondOptions);
                console.log('[test_room]: Clients connected.');
                resolve();
            }, 1000);


        });
    },

    /**
     * Test user connection on the room
     *
     * @param resolve
     * @param reject
     */
    testRoomConnection: function (resolve, reject) {
        console.log('[test_room]: test room connection ...');
        let context = window.JitsiTestBrowser.test_room;

        // Check if there is participants
        if (context.secondApiClient.getParticipantsInfo().length !== 2) {
            // not participant
            reject({"status": "fail", "reason": "no_participant"})
        }

        // Check if there is framerate, so the connection is working
        // TODO: make it works!

        // context.mainApiClient.getNetworkStatistics().then(function (data) {
        //     console.log(data);
        // })
        //context.secondApiClient.getNetworkStatistics().then(function (data) {
        //     console.log(data);
        // })
        //
        resolve({
            "status": "fail",
            "post_message": "not_working_yet"
        });
    },

    /**
     * Close API connections, clear test interval
     */
    closeConnections: function () {
        let context = window.JitsiTestBrowser.test_room;
        console.log('[test_room]: Close connections ...');

        // Close connections for main & second client
        if (context.mainApiClient) {
            context.mainApiClient.executeCommand('hangup');
            context.secondApiClient.executeCommand('hangup');
            context.mainApiClient.removeEventListener("videoConferenceLeft");
            context.mainApiClient.removeEventListener("participantJoined");
            setTimeout(function () {
                if (context.mainApiClient){
                    context.mainApiClient.dispose();
                }
                if (context.secondApiClient) {
                    context.secondApiClient.dispose();
                }
                context.mainApiClient = undefined;
                context.secondApiClient = undefined;
            }, 1000);
            localStorage.setItem('language', context.lang.stored);
        }
        // Remove timeouts
        if (context.testInterval) {
            clearInterval(context.testInterval);
            context.testInterval = undefined;
        }

        console.log('[test_room]: Connections closed.');
    },


    /**
     * Function to show test errors
     *
     * @param error
     */
    onError: function (error) {
        let context = window.JitsiTestBrowser.test_room;

        console.log('[test_room]: Error');

        context.statuses = "error";

        let details = error;
        if (error instanceof Error) {
            details = error.toString();

        } else if (error instanceof Object) {
            details = JSON.stringify(error);
        }
        console.log(details);
    },

    /**
     * Function to show test success
     *
     * @param result
     */
    onSuccess: function (result) {
        console.log('[test_room]: All test successful');
        console.log(result);
    }
}