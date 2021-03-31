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
const displayMediaConstraints = {
    ...userMediaConstraints,
    audio: {
        autoGainControl: false,
        echoCancellation: false,
        latency: 0,
        noiseSuppression: false,
        sampleRate: 48000,
        sampleSize: 16,
        volume: 1.0
    }
}

function shouldShowDisplay() {
    // @ts-ignore
    return (new URL(location)).searchParams.get('showDisplay');
}

function getWebCamStream(): Promise<MediaStream> {
    console.log('Getting user media with constraints', userMediaConstraints);
    return navigator.mediaDevices.getUserMedia(userMediaConstraints)
}

function getDisplayStream(): Promise<MediaStream> {
    console.log('Getting display media with constraints', displayMediaConstraints);
    // @ts-ignore
    return navigator.mediaDevices.getDisplayMedia(displayMediaConstraints)
}

export function getStream(): Promise<MediaStream> {
    return shouldShowDisplay() ? getDisplayStream() : getWebCamStream();
}

export function showLocalVideoStream(stream: MediaStream): void {
    console.log('Adding local stream.');
    const localVideo = document.querySelector('#localVideo');
    if (localVideo) {
        (localVideo as HTMLVideoElement).srcObject = stream;
    }
}

export function addASuperCrappyMuteAndDisableVideoShortcut(stream: MediaStream): void {
    window.onkeydown = ({code}: KeyboardEvent) => {
        if (code === 'KeyM') {
            const audioStream = stream.getAudioTracks()[0]
            audioStream.enabled = !audioStream.enabled
            console.log('Is my audio enabled? ' + audioStream.enabled)
            if (audioStream.enabled) {
                document.getElementById('mic-on')!.style!.display = 'block'
                document.getElementById('mic-off')!.style!.display = 'none'
            } else {
                document.getElementById('mic-on')!.style!.display = 'none'
                document.getElementById('mic-off')!.style!.display = 'block'
            }
        }
        
        if (code === 'KeyV') {
            const videoStream = stream.getVideoTracks()[0]
            videoStream.enabled = !videoStream.enabled
            console.log('Is my video enabled? ' + videoStream.enabled)
        }
    }
}