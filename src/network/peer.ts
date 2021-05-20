import { Peer, MyStream, MyPosition } from "../domain/types";
import { MyEventEmitter } from "../shared/myEventEmitter";
import SimplePeer from "simple-peer";
import { deserializer, serializer } from "./de-serializer";

export class PeerSwarmSimplePeer implements Peer {
    onDisconnect = new MyEventEmitter<void>();
    onPositionUpdate = new MyEventEmitter<MyPosition>();
    onStream = new MyEventEmitter<MyStream>();

    constructor(
        private readonly peer: SimplePeer.Instance,
        public readonly id: string
    ) {
        peer.on("stream", (stream: MediaStream) => {
            this.onStream.emit({ stream });
        });

        peer.on("data", (data: Buffer) => {
            const position = deserializer(data);
            this.onPositionUpdate.emit(position);
        });

        peer.on("close", () => {
            this.onDisconnect.emit();
        });
    }

    async sendLocalPosition(localPosition: MyPosition): Promise<void> {
        const data: ArrayBuffer = serializer(localPosition);
        this.peer.send(data);
    }

    async sendLocalStream({ stream }: MyStream): Promise<void> {
        this.peer.addStream(stream);
    }
}
