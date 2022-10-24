import { Avatar, MyPosition, MyStream, PeerType } from "../domain/types";
import { Listener } from "../shared/my-event-emitter";
import { $ } from "../shared/selector";

export class AvatarMock implements Avatar {
    private div: HTMLDivElement;

    constructor(private peerId: string) {
        const div = document.createElement("div");
        this.div = div;
        div.id = `participant-${peerId}`;
        div.innerHTML = `
              <div id="name-${peerId}"></div>
              <div id="color-${peerId}"></div>
              <div id="type-${peerId}"></div>
              <div id="position-${peerId}"></div>
              <video id="video-${peerId}" autoplay></video>
              <audio id="audio-${peerId}" autoplay></audio>
        `;
        $("#local").parentElement!.appendChild(div);
    }

    moveTo: Listener<MyPosition> = async (pos) => {
        $(`#position-${this.peerId}`).innerHTML = JSON.stringify(pos);
    };

    remove: Listener<void> = async () => {
        this.div.remove();
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
