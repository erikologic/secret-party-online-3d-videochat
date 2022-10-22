import { Avatar, MyPosition, PeerType, VirtualWorld } from "../domain/types";
import { MyEventEmitter } from "../shared/my-event-emitter";
import { AvatarMock } from "./avatar-mock";

export class VirtualWordMock implements VirtualWorld {
    onPositionUpdate = new MyEventEmitter<MyPosition>();

    createAvatar(peerId: string): Avatar {
        return new AvatarMock(peerId);
    }

    setType(_type: PeerType): void {
        throw new Error("not implemented");
    }

    start(): Promise<void> {
        return Promise.resolve(undefined);
    }
}
