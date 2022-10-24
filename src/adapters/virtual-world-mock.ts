import { Avatar, MyPosition, PeerType, VirtualWorld } from "../domain/types";
import { MyEventEmitter } from "../shared/my-event-emitter";
import { AvatarMock } from "./avatar-mock";
import { $ } from "../shared/selector";

export class VirtualWordMock implements VirtualWorld {
    onPositionUpdate = new MyEventEmitter<MyPosition>();

    constructor() {
        $<HTMLInputElement>(`#send-position`).addEventListener("click", () => {
            const position = JSON.parse(
                $<HTMLInputElement>(`#my-position`).value
            );
            this.onPositionUpdate.emit(position);
        });
    }

    createAvatar(peerId: string): Avatar {
        return new AvatarMock(peerId);
    }

    setType(type: PeerType): void {
        $<HTMLInputElement>(`#type`).value = type;
    }

    async start(): Promise<void> {
        $<HTMLInputElement>(`#virtual-world`).value = "Started";
    }
}
