class WebRTCUtils {


    /**
     * Test if RTCPeerConnection API is present
     * @returns {boolean}
     */
    isPeerConnectionSupported = function () {
        let rtcConfig = {};
        try {
            return new RTCPeerConnection(rtcConfig) !== undefined;
        } catch (err) {
            console.log("Peer connection not supported")
            return false;
        }
    }

    /**
     * Test if Browser support is part of banned browser
     * @returns {boolean}
     */
    isBannedBrowser = function () {
        return (bowser.msie || bowser.safari || bowser.msedge);
    }

    /**
     * try to capture a media by its type(audio or video)
     * @param {string} mediaType - selected media type : audio|video
     * @param {function} success - callback that handles capture track labels
     * @param {function} error - callback on error
     */
    getDefaultMediaCapture = function (mediaType, success, error) {
        const mediaStreamConstraints = {
            video: mediaType === "video",
            audio: mediaType === "audio"
        };

        navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
            .then(function (mediaStream) {
                /* use the stream */
                let trackLabels = "";
                mediaStream.getTracks().forEach(function (track) {
                    trackLabels += track.label;
                    track.stop();
                });
                success(trackLabels);
            })
            .catch(function (err) {
                error(err);
            });
    }


    /**
     * Get All Media devices seen by the navigator
     *
     * @param {function} success - callback that handles a mediaInfo object containing media labels
     * @param {function} error - callback on error
     */
    getListDevices = function(success, error){
        navigator.mediaDevices.enumerateDevices()
            .then(function (devices){
                let mediaInfo = {
                    audioinput:[],
                    audiooutput:[],
                    videoinput :[]
                };
                console.log(devices);
                devices.forEach(function(deviceInfo) {
                    if (deviceInfo.kind === 'audioinput')
                        mediaInfo.audioinput.push(deviceInfo.label);
                    else if (deviceInfo.kind === 'audiooutput')
                        mediaInfo.audiooutput.push(deviceInfo.label);
                    else if (deviceInfo.kind === 'videoinput')
                        mediaInfo.videoinput.push(deviceInfo.label);
                });
                success(mediaInfo);
            })
            .catch(function(err) {
                error(err);
            });
    }


    /**
     * Wait function
     *
     * @param delay Delay to wait
     * @return {Promise<*>}
     */
    wait = function (delay) {
        if (!delay) delay = 1000;
        return new Promise(r => setTimeout(r, delay))
    }
}