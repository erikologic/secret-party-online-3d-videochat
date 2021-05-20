import { Local, MyStream } from "../domain/types";

const userMediaConstraints = {
    audio: true,
    video: {
        width: {
            ideal: 160,
            max: 640,
        },
        height: {
            ideal: 120,
            max: 480,
        },
        frameRate: {
            ideal: 20,
            max: 30,
        },
        facingMode: "user",
    },
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
        volume: 1.0,
    },
};

export class LocalBrowser implements Local {
    private myStream: MyStream | undefined;

    async getLocalStream(): Promise<MyStream> {
        const stream = await (LocalBrowser.shouldShowDisplay()
            ? LocalBrowser.getDisplayStream()
            : LocalBrowser.getWebCamStream());
        this.myStream = { stream };
        this.addASuperCrappyMuteAndDisableVideoShortcut(stream);
        return this.myStream;
    }

    showLocalVideo(): void {
        console.log("Adding local stream.");
        const localVideo = document.querySelector("#localVideo");
        if (this.myStream) {
            (localVideo as HTMLVideoElement).srcObject = this.myStream.stream;
        }
    }

    private static shouldShowDisplay(): boolean {
        // @ts-ignore
        return new URL(location).searchParams.get("showDisplay");
    }

    private static getWebCamStream(): Promise<MediaStream> {
        console.log(
            "Getting user media with constraints",
            userMediaConstraints
        );
        return navigator.mediaDevices.getUserMedia(userMediaConstraints);
    }

    private static getDisplayStream(): Promise<MediaStream> {
        console.log(
            "Getting display media with constraints",
            displayMediaConstraints
        );
        // @ts-ignore
        return navigator.mediaDevices.getDisplayMedia(displayMediaConstraints);
    }

    private addASuperCrappyMuteAndDisableVideoShortcut(
        stream: MediaStream
    ): void {
        window.onkeydown = ({ code }: KeyboardEvent) => {
            if (code === "KeyM") {
                const audioStream = stream.getAudioTracks()[0];
                audioStream.enabled = !audioStream.enabled;
                console.log("Is my audio enabled? " + audioStream.enabled);
                if (audioStream.enabled) {
                    document.getElementById("mic-icon-on")!.style!.display =
                        "block";
                    document.getElementById("mic-icon-off")!.style!.display =
                        "none";
                    document.getElementById("mic")!.className =
                        "mic-background-on";
                } else {
                    document.getElementById("mic-icon-on")!.style!.display =
                        "none";
                    document.getElementById("mic-icon-off")!.style!.display =
                        "block";
                    document.getElementById("mic")!.className =
                        "mic-background-off";
                }
            }

            if (code === "KeyV") {
                const videoStream = stream.getVideoTracks()[0];
                videoStream.enabled = !videoStream.enabled;
                console.log("Is my video enabled? " + videoStream.enabled);
            }
        };
    }
}
