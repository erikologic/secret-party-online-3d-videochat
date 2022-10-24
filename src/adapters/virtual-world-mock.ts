import { Avatar, MyPosition, PeerType, VirtualWorld } from "../domain/types";
import { MyEventEmitter } from "../shared/my-event-emitter";
import { AvatarMock } from "./avatar-mock";
import { $ } from "../shared/selector";

export class VirtualWordMock implements VirtualWorld {
    // TODO
    onPositionUpdate = new MyEventEmitter<MyPosition>();

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
