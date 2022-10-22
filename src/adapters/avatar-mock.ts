import { Avatar, MyPosition, MyStream, PeerType } from "../domain/types";
import { Listener } from "../shared/my-event-emitter";
import { $ } from "../shared/selector";

export class AvatarMock implements Avatar {
    constructor(private peerId: string) {
        const div = document.createElement("div");
        div.id = `participant-${peerId}`;
        div.innerHTML = `
              <video id="video-${peerId}" autoplay></video>
              <audio id="audio-${peerId}" autoplay></audio>
              <div class="info-bar">
                <div id="name-${peerId}"></div>
                <div id="color-${peerId}"></div>
                <div id="type-${peerId}"></div>
              </div>
        `;
        $("#local").parentElement!.appendChild(div);
    }

    moveTo: Listener<MyPosition> = async (_pos) => {
        console.error("not implemented");
        throw new Error("not implemented");
    };

    remove: Listener<void> = async () => {
        console.error("not implemented");
        throw new Error("not implemented");
    };

    showAudio: Listener<MyStream> = async ({ stream }) => {
        $<HTMLAudioElement>(`#audio-${this.peerId}`).srcObject = stream;
    };

    showVideo: Listener<MyStream> = async ({ stream }) => {
        $<HTMLVideoElement>(`#video-${this.peerId}`).srcObject = stream;
    };

    calcAngle(): number {
        // TODO
        return 5;
    }

    calcDistance(): number {
        // TODO
        return 5;
    }

    setColor(color: string): void {
        $(`#color-${this.peerId}`).innerHTML = color;
    }

    setName(name: string): void {
        $(`#name-${this.peerId}`).innerHTML = name;
    }

    setType(type: PeerType): void {
        $(`#type-${this.peerId}`).innerHTML = type;
    }
}
