const userMediaConstraints = {
    audio: true,
    video: {
        width: { max: 256 },
        height: { max: 144 },
        frameRate: 20,
        facingMode: 'user'
    }
};

export function getLocalStream() {
    console.log('Getting user media with constraints', userMediaConstraints);
    return navigator.mediaDevices.getUserMedia(userMediaConstraints)
}

export function showLocalVideoStream(stream) {
    console.log('Adding local stream.');
    var localVideo = document.querySelector('#localVideo');
    localVideo.srcObject = stream;
}