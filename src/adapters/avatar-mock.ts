import { Avatar, MyPosition, MyStream, PeerType } from "../domain/types";
import { Listener } from "../shared/my-event-emitter";

export class AvatarMock implements Avatar {
    constructor(_peerId: string) {
        throw new Error("not implemented");
    }

    moveTo: Listener<MyPosition> = async (_pos) => {
        throw new Error("not implemented");
    };

    remove: Listener<void> = async () => {
        throw new Error("not implemented");
    };

    showAudio: Listener<MyStream> = async () => {
        throw new Error("not implemented");
    };

    showVideo: Listener<MyStream> = async () => {
        throw new Error("not implemented");
    };

    calcAngle(): number {
        throw new Error("not implemented");
    }

    calcDistance(): number {
        throw new Error("not implemented");
    }

    setColor(color: string): void {
        throw new Error("not implemented");
    }

    setName(name: string): void {
        throw new Error("not implemented");
    }

    setType(type: PeerType): void {
        throw new Error("not implemented");
    }
}
