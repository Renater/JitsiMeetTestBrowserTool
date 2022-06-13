/**
 * TestCase: test_network
 */

if (!window.hasOwnProperty('JitsiTestBrowser'))
    window.JitsiTestBrowser = {};


/**
 * Test network case
 *
 * @type {{timestampPrev: undefined, localPeerConnection: undefined, run: (function(): Promise<*>), testFail: Window.JitsiTestBrowser.test_network.testFail, getNetworkStatistics: Window.JitsiTestBrowser.test_network.getNetworkStatistics, onAddIceCandidateSuccess: Window.JitsiTestBrowser.test_network.onAddIceCandidateSuccess, hangup: Window.JitsiTestBrowser.test_network.hangup, onsignalingstatechange: Window.JitsiTestBrowser.test_network.onsignalingstatechange, stats: {tcp: {jitter: *[], droppedFrames: number, packetsLost: number, fps: *[], bitrate: *[]}, udp: {jitter: *[], droppedFrames: number, packetsLost: number, fps: *[], bitrate: *[]}, video: {remote: *[], local: *[]}}, testWebSocket: (function(): Promise<*>), testTCP: (function(): Promise<*>), initiateMediaConnexion: (function(*): Promise<unknown>), initTURNCredentials: Window.JitsiTestBrowser.test_network.initTURNCredentials, showLocalStats: Window.JitsiTestBrowser.test_network.showLocalStats, testing_protocol: undefined, localVideo: undefined, remoteVideo: undefined, networkEvent: Event, onicecandidate: Window.JitsiTestBrowser.test_network.onicecandidate, turn_credentials: *[], createPeerConnection: Window.JitsiTestBrowser.test_network.createPeerConnection, oniceconnectionstatechange: Window.JitsiTestBrowser.test_network.oniceconnectionstatechange, onAddIceCandidateError: Window.JitsiTestBrowser.test_network.onAddIceCandidateError, statuses: {}, intervalID: undefined, bytesPrev: undefined, testUDP: (function(): Promise<*>), turn_servers: *[], remotePeerConnection: undefined, localStream: undefined, showRemoteStats: Window.JitsiTestBrowser.test_network.showRemoteStats}}
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

    networkEvent: new Event('"status": "fail"'),

    /**
     * Run test
     *
     * @return {Promise<unknown>}
     */
    run: function () {
        return new Promise(resolve => {
            console.log("> Running test_network");

            let context = window.JitsiTestBrowser.test_network;

            // Init TURN credentials
            context.initTURNCredentials(function(){

                context.localVideo = document.querySelector('video#local_video');
                context.remoteVideo = document.querySelector('video#remote_video');

                // Run websocket test
                context.testWebSocket().then(function (result) {
                    context.networkEvent.data = result;
                    document.dispatchEvent(context.networkEvent);

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

                            let res = {
                                "status": allOK ? "success" : "fail",
                                "message": allOK ? "network_success_message" : '',
                                "details" : context.statuses
                            };

                            resolve(res);
                        })
                    });
                });
            }, function(reason){
                resolve({"status": "fail", "details": reason});
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
                context.networkEvent.data = {"local": {"video_dimension": {"width": width, "height": height}}};
                document.dispatchEvent(context.networkEvent);
            }
            if (context.remoteVideo.videoWidth) {
                const rHeight = context.remoteVideo.videoHeight;
                const rWidth = context.remoteVideo.videoWidth;

                context.networkEvent.data = {"remote": {"video_dimension": {"width": rWidth, "height": rHeight}}};
                document.dispatchEvent(context.networkEvent);
            }
        }, 1000);
    },

    /**
     * Init TURN credentials
     */
    initTURNCredentials: function (resolve) {
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
                            resolve();
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
                console.log(`Got data from WSS: ${messageEvent.data}`)
                if (messageEvent.data === `echo ${expected}`) {
                    wbs.close();
                    context.statuses['wss'] = true;

                    resolve({"status": "success", "details": {"protocol": "wss"}});
                } else {
                    context.statuses['wss'] = false;
                    wbs.close();
                    let err = {"status": "fail", "details": {"protocol": "wss",  "message": messageEvent.data}};
                    context.testFail(err);
                    resolve(err);
                }
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

            let context = window.JitsiTestBrowser.test_network;
            context.testing_protocol = 'tcp';

            // Start getting network statistics
            context.getNetworkStatistics();

            context.initiateMediaConnexion("tcp").then(function (result) {
                if (result instanceof Object && result.status === 'success') {
                    let utils = new WebRTCUtils();
                    utils.wait(5000).then(function () {
                        resolve();
                    });
                } else {
                    context.testFail('tcp', result);
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

            let context = window.JitsiTestBrowser.test_network;
            context.testing_protocol = 'udp';

            // Start getting network statistics
            context.getNetworkStatistics();

            context.initiateMediaConnexion("udp")
                .then(function (result) {
                        if (result instanceof Object && result.status === 'success') {
                            let utils = new WebRTCUtils();
                            utils.wait(5000).then(function () {
                                resolve({"status": "success", "details": {"protocol": "udp"}});
                            });
                        } else {
                            context.testFail('udp', result);
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
        let context = window.JitsiTestBrowser.test_network;

        // calculate video bitrate
        results.forEach(report => {
            const now = report.timestamp;

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

                context.networkEvent.data = {"bitrate": bitrate};
                document.dispatchEvent(context.networkEvent);

                // TODO: show on UI
                // context.updateBitrateAverage();
            }

            if (report.framesPerSecond) {
                context.networkEvent.data = {"framerate": report.framesPerSecond};
                document.dispatchEvent(context.networkEvent);
            }
            if (report.framesDropped) {
                context.networkEvent.data = {"framesDropped": report.framesDropped};
                document.dispatchEvent(context.networkEvent);
            }
            if (report.packetsLost) {
                context.networkEvent.data = {"packetsLost": report.packetsLost};
                document.dispatchEvent(context.networkEvent);
            }
            if (report.jitter) {
                context.networkEvent.data = {"jitter": report.jitter};
                document.dispatchEvent(context.networkEvent);
            }

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
                context.networkEvent.data = {"ip_connected_to": `${remoteCandidate.address}:${remoteCandidate.port}`};
                document.dispatchEvent(context.networkEvent);
            } else if (remoteCandidate.ip && remoteCandidate.port) {
                context.networkEvent.data = {"ip_connected_to": `${remoteCandidate.ip}:${remoteCandidate.port}`};
                document.dispatchEvent(context.networkEvent);
            } else if (remoteCandidate.ipAddress && remoteCandidate.portNumber) {
                context.networkEvent.data = {"ip_connected_to": `${remoteCandidate.ipAddress}:${remoteCandidate.portNumber}`};
                document.dispatchEvent(context.networkEvent);
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

        context.networkEvent.data = {"error": details};
        document.dispatchEvent(context.networkEvent);
    },
}