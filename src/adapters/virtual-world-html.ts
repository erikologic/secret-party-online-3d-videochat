import { Avatar, MyPosition, PeerType, VirtualWorld } from "../domain/types";
import { MyEventEmitter } from "../shared/my-event-emitter";
import { AvatarMock } from "./avatar-mock";
import { $ } from "../shared/selector";

const template = `
    <div id="local">
        <label for="type">Type</label>
        <input type="text" id="type" readonly>
        <label for="virtual-world">Virtual World</label>
        <input type="text" id="virtual-world" readonly>
        <div>
            <label for="my-position">Position</label>
            <input type="text" id="my-position">
            <button id="send-position">Send position</button>
        </div>
    </div>
`;

export class VirtualWordHtml implements VirtualWorld {
    onPositionUpdate = new MyEventEmitter<MyPosition>();

    createAvatar(peerId: string): Avatar {
        return new AvatarMock(peerId);
    }

    setType(type: PeerType): void {
        $<HTMLInputElement>(`#type`).value = type;
    }

    async start(): Promise<void> {
        $<HTMLInputElement>(`canvas`).remove();
        $<HTMLInputElement>(`body`).insertAdjacentHTML("afterbegin", template);
        $<HTMLInputElement>(`body`).style.backgroundColor = "white";
        $<HTMLInputElement>(`body`).style.color = "black";
        $<HTMLInputElement>(`#virtual-world`).value = "Started";

        $<HTMLInputElement>(`#send-position`).addEventListener("click", () => {
            const position = JSON.parse(
                $<HTMLInputElement>(`#my-position`).value
            );
            this.onPositionUpdate.emit(position);
        });
    }
}
