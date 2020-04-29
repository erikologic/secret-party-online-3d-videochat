const userMediaConstraints = {
    audio: true,
    video: {
        width: { max: 256 },
        height: { max: 144 },
        frameRate: 20,
        facingMode: 'user'
    }
};

export function getLocalStream(): Promise<MediaStream> {
    console.log('Getting user media with constraints', userMediaConstraints);
    return navigator.mediaDevices.getUserMedia(userMediaConstraints)
}

export function showLocalVideoStream(stream: MediaStream): void {
    console.log('Adding local stream.');
    const localVideo = document.querySelector('#localVideo');
    if (localVideo) {
        (localVideo as HTMLVideoElement).srcObject = stream;
    }
}