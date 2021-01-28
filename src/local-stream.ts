const userMediaConstraints = {
    audio: true,
    video: {
        width: {
            ideal: 160,
            max: 640
        },
        height: {
            ideal: 120,
            max: 480
        },
        frameRate: {
            ideal: 20,
            max: 30
        },
        facingMode: 'user'
    }
};

function shouldShowDisplay() {
    // @ts-ignore
    return (new URL(location)).searchParams.get('showDisplay');
}

function getWebCamStream(): Promise<MediaStream> {
    console.log('Getting user media with constraints', userMediaConstraints);
    return navigator.mediaDevices.getUserMedia(userMediaConstraints)
}

function getDisplayStream(): Promise<MediaStream> {
    console.log('Getting user media with constraints', userMediaConstraints);
    // @ts-ignore
    return navigator.mediaDevices.getDisplayMedia(userMediaConstraints)
}

export function getStream(): Promise<MediaStream> {
    console.log('Getting user media with constraints', userMediaConstraints);
    return shouldShowDisplay() ? getDisplayStream() : getWebCamStream();
}

export function showLocalVideoStream(stream: MediaStream): void {
    console.log('Adding local stream.');
    const localVideo = document.querySelector('#localVideo');
    if (localVideo) {
        (localVideo as HTMLVideoElement).srcObject = stream;
    }
}