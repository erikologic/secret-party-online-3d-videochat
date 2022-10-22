import { Avatar, MyPosition, PeerType, VirtualWorld } from "../domain/types";
import { MyEventEmitter } from "../shared/my-event-emitter";
import { AvatarMock } from "./avatar-mock";

export class VirtualWordMock implements VirtualWorld {
    onPositionUpdate = new MyEventEmitter<MyPosition>();

    createAvatar(peerId: string): Avatar {
        return new AvatarMock(peerId);
    }

    setType(type: PeerType): void {
        (document.getElementById("type")! as HTMLInputElement).value = type;
    }

    start(): Promise<void> {
        return Promise.resolve(undefined);
    }
}
