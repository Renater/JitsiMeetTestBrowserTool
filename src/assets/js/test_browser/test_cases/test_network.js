/**
 * TestCase: test_network
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};

if (!window.JitsiTestBrowser.hasOwnProperty('test_network'))
    window.JitsiTestBrowser.test_network = {};


/**
 * Test network case
 */
window.JitsiTestBrowser.test_network = {

    /**
     * TURN credentials
     */
    turn_credentials: [],

    /**
     * TURN servers
     */
    turn_servers: [],


    /**
     * Global local media stream object
     */
    localStream: undefined,

    /**
     * Local peer connection
     */
    localPeerConnection: undefined,

    /**
     * Remote peer connection
     */
    remotePeerConnection: undefined,


    /**
     * Local video
     */
    localVideo: undefined,

    /**
     * Remote video
     */
    remoteVideo: undefined,

    /**
     * Tests statuses
     */
    statuses: {},

    /**
     * Interval ID to stop get stats interval
     */
    intervalID: undefined,


    /**
     * Variables used to get RTC stats
     */
    testing_protocol: undefined,
    bytesPrev: undefined,
    timestampPrev: undefined,
    stats: {
        tcp:{
            bitrate: [],
            packetsLost: 0,
            fps: [],
            droppedFrames: 0,
            jitter: []
        },
        udp:{
            bitrate: [],
            packetsLost: 0,
            fps: [],
            droppedFrames: 0,
            jitter: []
        },
        video:{
            local: [],
            remote: []
        }
    },

    networkEvent: new Event('network_stat'),

    /**
     * Run test
     *
     * @return {Promise<unknown>}
     */
    run: function () {
        return new Promise(res => {
            console.log("> Running test_network");
            window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.PROCESSING, "context": "test_network"});

            let context = window.JitsiTestBrowser.test_network;

            context.localVideo = document.querySelector('video#local_video');
            context.remoteVideo = document.querySelector('video#remote_video');

            // Init TURN credentials
            context.initTURNCredentials(function(result){
                if (result.status === "fail"){
                    window.JitsiTestEvents.dispatch('network_stat', {"context": "wss", "data": result});
                }

                // Run websocket test
                context.testWebSocket().then(function (result) {

                    // Run UDP test
                    context.testUDP().then(function () {
                        // Stop getting statistics
                        if (context.intervalID) clearInterval(context.intervalID)

                        // Reset stats
                        context.bytesPrev = 0;
                        context.timestampPrev = 0;

                        // Close connection
                        context.hangup();

                        // Next: test TCP protocol
                        context.testTCP().then(function () {
                            // Stop getting statistics
                            if (context.intervalID) clearInterval(context.intervalID)

                            // Reset stats
                            context.bytesPrev = 0;
                            context.timestampPrev = 0;

                            // Close connection
                            context.hangup();

                            // Show final test results
                            let allOK = Object.keys(context.statuses).length > 0;

                            Object.keys(context.statuses).forEach(status => {
                                if (context.statuses[status] === false){
                                    allOK = false;
                                    context.statuses[status] = "fails"
                                }else{
                                    context.statuses[status] = "success";
                                }
                            });

                            // Push statistics
                            context.pushStatistics();

                            window.JitsiTestBrowser.runner.resolve(res, {"result": allOK ? "success" : "fail"}, "test_network");
                        })
                    });
                });
            }, function(reason){
                window.JitsiTestBrowser.runner.resolve(res, {"result": "fail", "details": reason}, "test_network");
            });

        });
    },

    /**
     * Get network statistics
     */
    getNetworkStatistics: function () {
        let context = window.JitsiTestBrowser.test_network;

        context.intervalID = setInterval(() => {
            if (context.localPeerConnection && context.remotePeerConnection) {
                context.remotePeerConnection
                    .getStats(null)
                    .then(context.showRemoteStats, err => {
                        console.log(err);
                        throw err;
                    });
                context.localPeerConnection
                    .getStats(null)
                    .then(context.showLocalStats, err => {
                        console.log(err);
                        throw err;
                    });
            } else {
                console.log('Not connected yet');
            }
            // Collect some stats from the video tags.
            if (context.localVideo.videoWidth) {
                const width = context.localVideo.videoWidth;
                const height = context.localVideo.videoHeight;

                context.stats['video']['local'] = {video_dimension: {"width": width, "height": height}};

                window.JitsiTestEvents.dispatch('network_stat', {"context":"video_player", "data": {"local": {"video_dimension": {"width": width, "height": height}}}});
            }
            if (context.remoteVideo.videoWidth) {
                const rHeight = context.remoteVideo.videoHeight;
                const rWidth = context.remoteVideo.videoWidth;

                context.stats['video']['remote'] = {video_dimension: {"width": rWidth, "height": rHeight}};

                window.JitsiTestEvents.dispatch('network_stat', {"context":"video_player", "data": {"remote": {"video_dimension": {"width": rWidth, "height": rHeight}}}});
            }
        }, 1000);
    },

    /**
     * Init TURN credentials
     */
    initTURNCredentials: function (resolve, reject) {
        let context = window.JitsiTestBrowser.test_network;

        let turnServer = document.getElementById('main').getAttribute('data-turn-endpoint');

        let settings = {
            method: 'get',
        };

        fetch(turnServer, settings)
            .then(response => {
                    response.json()
                        .then(function (data) {
                            context.turn_servers = {
                                "username": data.username,
                                "credential": data.credentials,
                                "tcp_urls": data.tcpTestUrl,
                                "udp_urls": data.udpTestUrl,
                            };
                            resolve({"status": "success"});
                        })
                }
            )
            .catch(reason => {
                resolve({"status": "fail", "details": reason.toString()});
            });
    },


    // Test functions

    /**
     * Test web socket
     *
     * @return {Promise<unknown>}
     */
    testWebSocket: function () {
        return new Promise(resolve => {
            console.log(" >>> Test WebSocket connection");

            window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.PROCESSING, "component": "wss"});

            let context = window.JitsiTestBrowser.test_network;
            context.testing_protocol = 'wss';

            let wssUrl = document.getElementById('main').getAttribute('data-websocket-url');

            let wbs = new WebSocket(wssUrl);
            let expected = 'this is a connection test';

            wbs.onopen = function () {
                console.log('WSS connection established');
                wbs.send(expected);
            };

            wbs.onmessage = function (messageEvent) {
                console.log(`Got data from WSS: ${messageEvent.data}`);
                let result;

                if (messageEvent.data === `echo ${expected}`) {
                    wbs.close();
                    context.statuses['wss'] = true;
                    result = {"status": "success"};

                } else {
                    context.statuses['wss'] = false;
                    wbs.close();
                    result = {"status": "fail", "details": {"protocol": "wss",  "message": messageEvent.data}};
                    context.testFail(err);
                    resolve(err);
                }

                window.JitsiTestEvents.dispatch('network_stat', {"context":"wss", "data": result});

                resolve(result);
            };

            wbs.onerror = function () {
                context.statuses['wss'] = false;
                wbs.close();
                let err = {"status": "fail", "details": {"protocol": "wss", "details": 'cannot_connect_wss'}};
                context.testFail('wss', err);
                resolve(err);
            };
        });
    },

    /**
     * Test TCP
     *
     * @return {Promise<unknown>}
     */
    testTCP: function () {
        return new Promise(resolve => {
            console.log(" >>> Test TCP media network");

            window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.PROCESSING, "component":"tcp"});

            let context = window.JitsiTestBrowser.test_network;
            context.testing_protocol = 'tcp';

            // Start getting network statistics
            context.getNetworkStatistics();

            context.initiateMediaConnexion("tcp").then(function (result) {
                if (result instanceof Object && result.status === 'success') {
                    let utils = new WebRTCUtils();
                    utils.wait(5000).then(function () {

                        window.JitsiTestEvents.dispatch('network_stat', {"context": "tcp", "data": result});

                        resolve();
                    });
                } else {
                    context.testFail('tcp', result);

                    window.JitsiTestEvents.dispatch('network_stat', {"context": "tcp", "data": result});

                    resolve();
                }
            });
        });
    },



    /**
     * Test UDP
     *
     * @return {Promise<unknown>}
     */
    testUDP: function () {
        return new Promise(resolve => {
            console.log(" >>> Test UDP media network");

            window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.PROCESSING, "component": "udp"});

            let context = window.JitsiTestBrowser.test_network;
            context.testing_protocol = 'udp';

            // Start getting network statistics
            context.getNetworkStatistics();

            context.initiateMediaConnexion("udp")
                .then(function (result) {
                        if (result instanceof Object && result.status === 'success') {
                            let utils = new WebRTCUtils();
                            utils.wait(5000).then(function () {

                                window.JitsiTestEvents.dispatch('network_stat', {"context":"udp", "data": result});

                                resolve({"status": "success", "details": {"protocol": "udp"}});
                            });
                        } else {
                            context.testFail('udp', result);

                            window.JitsiTestEvents.dispatch('network_stat', {"context":"udp", "data": result});

                            resolve();
                        }
                    }
                );
        });
    },


    // WebRTC functions

    /**
     * Initiate a media connexion for protocol
     *
     * @param protocol
     */
    initiateMediaConnexion: function (protocol) {
        return new Promise(resolve => {
            if (protocol !== 'tcp' && protocol !== 'udp') {
                resolve({"status": "fail", "details": {"message": "unknown_protocol"}})

            } else {
                let context = window.JitsiTestBrowser.test_network;

                if (context.localStream) {
                    context.localStream.getTracks().forEach(track => track.stop());
                    const videoTracks = context.localStream.getVideoTracks();
                    for (let i = 0; i !== videoTracks.length; ++i) {
                        videoTracks[i].stop();
                    }
                }

                // Init media constraints
                // Should be in config?
                let mediaStreamConstraints = {
                    video: {
                        width: {min: 300, max: 400, ideal: 320},
                        height: {min: 150, max: 300, ideal: 240},
                        frameRate: {min: 10, max: 60,}
                    },
                    audio: true
                };
                let rtcConfig = {
                    iceTransportPolicy: 'relay'
                };
                let servers = {
                    "username": context.turn_servers.username,
                    "credential": context.turn_servers.credential,
                    "urls": protocol === 'tcp' ? context.turn_servers.tcp_urls : context.turn_servers.udp_urls
                };
                rtcConfig.iceServers = [servers];

                // Get user media
                navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
                    .then(function (mediaStream) {
                        /* use the stream */
                        console.log('GetUserMedia succeeded');
                        context.localStream = mediaStream;
                        context.localVideo.srcObject = mediaStream;
                        context.createPeerConnection(rtcConfig)
                        context.statuses[protocol] = true;
                        resolve({"status": "success", "details": {"message": "GetUserMedia succeeded"}})
                    })
                    .catch(function (err) {
                        resolve({"status": "fail", "details": err.toString()});
                    })
            }
        });
    },


    /**
     * Create peer connection
     *
     * @param rtcConfig
     */
    createPeerConnection: function (rtcConfig = null) {
        console.log('Call Start');
        let context = window.JitsiTestBrowser.test_network;
        try {
            context.localPeerConnection = new RTCPeerConnection(rtcConfig);
            context.remotePeerConnection = new RTCPeerConnection(rtcConfig);
            context.localStream.getTracks().forEach(track => context.localPeerConnection.addTrack(track, context.localStream));
            console.log('localPeerConnection creating offer');
            context.localPeerConnection.onnegotiationneeded = () => console.log('Negotiation needed - localPeerConnection');
            context.remotePeerConnection.onnegotiationneeded = () => console.log('Negotiation needed - remotePeerConnection');

            context.localPeerConnection.onicecandidate = e => {
                console.log('Candidate localPeerConnection');
                context.remotePeerConnection
                    .addIceCandidate(e.candidate)
                    .then(context.onAddIceCandidateSuccess, context.onAddIceCandidateError);
            };
            context.localPeerConnection.oniceconnectionstatechange = function(){
                context.oniceconnectionstatechange('localPeerConnection', context.localPeerConnection)
            };
            context.remotePeerConnection.oniceconnectionstatechange = function(){
                context.oniceconnectionstatechange('remotePeerConnection', context.remotePeerConnection)
            };
            context.localPeerConnection.onsignalingstatechange = function(){
                context.onsignalingstatechange('localPeerConnection', context.localPeerConnection)
            };
            context.remotePeerConnection.onsignalingstatechange = function(){
                context.onsignalingstatechange('remotePeerConnection', context.remotePeerConnection)
            };
            context.remotePeerConnection.onicecandidate = e => {
                console.log('Candidate remotePeerConnection');
                context.localPeerConnection
                    .addIceCandidate(e.candidate)
                    .then(context.onAddIceCandidateSuccess, context.onAddIceCandidateError);
            };
            context.remotePeerConnection.ontrack = e => {
                if (context.remoteVideo.srcObject !== e.streams[0]) {
                    console.log('remotePeerConnection got stream');
                    context.remoteVideo.srcObject = e.streams[0];
                }
            };
            context.localPeerConnection.createOffer().then(
                offer => {
                    console.log('localPeerConnection offering');
                    console.log(`localPeerConnection offer: ${offer.sdp}`);
                    context.localPeerConnection.setLocalDescription(offer);
                    context.remotePeerConnection.setRemoteDescription(offer);
                    context.remotePeerConnection.createAnswer().then(
                        answer => {
                            console.log('remotePeerConnection answering');
                            console.log(`remotePeerConnection answer: ${answer.sdp}`);
                            context.remotePeerConnection.setLocalDescription(answer);
                            context.localPeerConnection.setRemoteDescription(answer);
                        },
                        err => function () {
                            console.log(err)
                            throw err;
                        }
                    );
                },
                err => function () {
                    console.log(err)
                    throw err;
                }
            );
        } catch (err) {
            console.log(err)
            throw err;
        }
    },

    onAddIceCandidateSuccess: function () {
        // TODO: show on UI?
        console.log('AddIceCandidate success.');
    },

    onAddIceCandidateError: function (error) {
        // TODO: show on UI?
        console.error(`Failed to add Ice Candidate: ${error.toString()}`);
    },


    showLocalStats: function (results) {
        // Nothing useful to show for now
        // Keep this function just in case
    },

    /**
     * Handle network stats got from remove video
     *
     * @param results
     */
    showRemoteStats: function (results) {
        console.log(results);
        let context = window.JitsiTestBrowser.test_network;

        // calculate video bitrate
        results.forEach(report => {
            const now = report.timestamp;
            window.JitsiTestEvents.networkStat.context = context.testing_protocol;

            let bitrate;
            if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                const bytes = report.bytesReceived;
                if (context.timestampPrev) {
                    bitrate = 8 * (bytes - context.bytesPrev) / (now - context.timestampPrev);
                    bitrate = Math.floor(bitrate);
                }
                context.bytesPrev = bytes;
                context.timestampPrev = now;
            }
            if (bitrate) {
                context.stats[context.testing_protocol].bitrate.push(bitrate);

                window.JitsiTestEvents.dispatch('network_stat', {"data": {"bitrate": bitrate}});

                if (context.stats[context.testing_protocol].bitrate.length) {
                    let average = 0;
                    context.stats[context.testing_protocol].bitrate.forEach(bitrate => {
                        average += bitrate;
                    });
                    average = (average / context.stats[context.testing_protocol].bitrate.length).toFixed(2);

                    window.JitsiTestEvents.dispatch('network_stat', {"data": {"average_bitrate": average}});
                }
            }

            // Dispatch statistics
            ['framesPerSecond', 'framesDropped', 'packetsLost', 'jitter'].forEach(item => {
                if (report[item] !== undefined) {
                    let data = {};
                    data[item] = report[item];

                    context.stats[context.testing_protocol][item] = report[item];

                    window.JitsiTestEvents.dispatch('network_stat', {data});
                }
            });
        });

        // figure out the peer's ip
        let activeCandidatePair = null;
        let remoteCandidate = null;

        // Search for the candidate pair, spec-way first.
        results.forEach(report => {
            if (report.type === 'transport') {
                activeCandidatePair = results.get(report.selectedCandidatePairId);
            }
        });
        // Fallback for Firefox.
        if (!activeCandidatePair) {
            results.forEach(report => {
                if (report.type === 'candidate-pair' && report.selected) {
                    activeCandidatePair = report;
                }
            });
        }
        if (activeCandidatePair && activeCandidatePair.remoteCandidateId) {
            remoteCandidate = results.get(activeCandidatePair.remoteCandidateId);
        }
        if (remoteCandidate) {
            if (remoteCandidate.address && remoteCandidate.port) {
                window.JitsiTestEvents.dispatch('network_stat', {"data": {"ip_connected_to": `${remoteCandidate.address}:${remoteCandidate.port}`}});

            } else if (remoteCandidate.ip && remoteCandidate.port) {
                window.JitsiTestEvents.dispatch('network_stat', {"data": {"ip_connected_to": `${remoteCandidate.ip}:${remoteCandidate.port}`}});

            } else if (remoteCandidate.ipAddress && remoteCandidate.portNumber) {
                window.JitsiTestEvents.dispatch('network_stat', {"data": {"ip_connected_to": `${remoteCandidate.ipAddress}:${remoteCandidate.portNumber}`}});
            }
        }
    },

    /**
     * Close the 2 active peerConnection localPeerConnection and remotePeerConnection and release media capture
     */
    hangup: function () {
        let context = window.JitsiTestBrowser.test_network;
        if (context.localPeerConnection) {
            console.log("localPeerConnection iceConnectionState :" + context.localPeerConnection.iceConnectionState);
            console.log("remotePeerConnection iceConnectionState :" + context.remotePeerConnection.iceConnectionState);

            context.stateEnabled = false;
        }
        if (context.localPeerConnection) {
            context.localPeerConnection.close();
        }
        if (context.remotePeerConnection) {
            context.remotePeerConnection.close();
        }
        if (context.localStream) {
            context.localStream.getTracks().forEach(function (track) {
                track.stop();
            });
        }

        context.localVideo.srcObject = null;
        context.remoteVideo.srcObject = null;

        context.localPeerConnection = undefined;
        context.remotePeerConnection = undefined;
    },

    onsignalingstatechange: function (peerConnectionName, peerConnection) {
        console.log(peerConnectionName + ' ICE: ' + peerConnection.iceConnectionState);
    },

    oniceconnectionstatechange: function (peerConnectionName, peerConnection) {
        console.log(peerConnectionName + ' ICE: ' + peerConnection.iceConnectionState);
    },

    onicecandidate: function (peerConnectionName, peerConnection, event) {
        if (event.candidate) {
            peerConnection.addIceCandidate(event.candidate);
            console.log(peerConnectionName + ' ICE Candidate: ' + event.candidate.candidate);
        }
    },


    /**
     * Push final statistics
     */
    pushStatistics: function(){
        let context = window.JitsiTestBrowser.test_network;

        let stats = {
            "websocket": {
                "status" : context.statuses['wss'] ? "success" : "fail",
            },
            "tcp": {
                "status" : context.statuses['tcp'] ? "success" : "fail",
                "data": context.stats['tcp']

            },
            "udp": {
                "status" : context.statuses['udp'] ? "success" : "fail",
                "data": context.stats['udp']
            },
            "video":{
                "local": context.stats['video']['local'],
                "remote": context.stats['video']['local']
            }
        };

        window.JitsiTestBrowser.Statistics.addStat('test_network', stats );
    },

    /**
     * Default test fail handler
     *
     * @param protocol
     * @param result
     */
    testFail: function (protocol, result) {
        let context = window.JitsiTestBrowser.test_network;

        context.statuses[protocol] = false;

        let details = result;
        if (result instanceof Error) {
            details = result.toString();
        } else if (result instanceof Object) {
            details = JSON.stringify(result);
        }

        console.error(details);

        window.JitsiTestEvents.dispatch('network_stat', {"context": protocol, "data": result});
    },


    /**
     * Final resolve function
     *
     * @param res
     * @param data
     */
    resolve: function(res, data){
        window.JitsiTestEvents.dispatch('run', {"status": window.TestStatuses.ENDED, "context": "test_network"});
        res(data)
    }
}