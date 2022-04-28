import { Local, MyStream, PeerConfig } from "../../domain/types";

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
    video: {
        ...userMediaConstraints.video,
        height: {
            ideal: 480,
            max: 720,
        },
        width: {
            ideal: 848,
            max: 1280,
        },
        frameRate: {
            ideal: 25,
            max: 30,
        },
        aspectRatio: 1.777777778,
    },
};

export class LocalBrowser implements Local {
    private myStream: MyStream | undefined;
    private overlay: HTMLElement | null;

    constructor() {
        this.overlay = document.getElementById("overlay");
    }

    getConfig(): PeerConfig {
        const nameEl = document.getElementById("name") as HTMLInputElement;
        const name = nameEl.value;

        const colorEl = document.getElementById("color") as HTMLInputElement;
        const color = colorEl.value;

        const type = name.match(/tv/i) ? "tv" : "peer";
        return { color, name, type };
    }

    async getLocalStream(): Promise<MyStream> {
        let stream;
        try {
            stream = await LocalBrowser.getWebCamStream();
        } catch (e) {
            window.alert(
                "You need to give access to the webcam + audio to start the app"
            );
            this.overlay?.style.setProperty("display", "block");
            throw e;
        }
        this.myStream = { stream };
        this.addASuperCrappyMuteAndDisableVideoShortcut(stream);
        return this.myStream;
    }

    async getDesktopStream(): Promise<MyStream> {
        let stream;
        try {
            stream = await LocalBrowser.getDisplayStream();
        } catch (e) {
            window.alert(
                "You need to select something to stream to start the app"
            );
            this.overlay?.style.setProperty("display", "block");
            throw e;
        }
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
        window.addEventListener("keydown", (event) => {
            const { code } = event as KeyboardEvent;
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
        });
    }

    init(): void {
        if (!navigator.userAgent.match(/Chrome|Firefox/))
            window.alert(
                "Your browser is not supported" +
                    "\nPlease use the latest Chrome, or Firefox alternatively" +
                    "\nYou may continue but expect the app to not work properly"
            );

        const nameEl = document.getElementById(
            "name"
        ) as HTMLInputElement | null;
        if (!nameEl?.value) {
            window.alert("You need to provide a name");
            throw new Error("Cannot start");
        }

        if (
            !nameEl.value.match(/tv/i) &&
            !window.confirm("Are you wearing headphones?")
        ) {
            window.alert("Please put your headphones on!");
            throw new Error("Cannot start");
        }
        this.overlay?.style.setProperty("display", "none");
    }
}
