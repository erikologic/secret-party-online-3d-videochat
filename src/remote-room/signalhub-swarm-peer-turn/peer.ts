import { Peer, MyStream, MyPosition } from "../../domain/types";
import { MyEventEmitter } from "../../shared/my-event-emitter";
import { deserializer, serializer } from "./de-serializer";

export class PeerSwarmSimplePeer implements Peer {
    onDisconnect = new MyEventEmitter<void>();
    onPositionUpdate = new MyEventEmitter<MyPosition>();
    onStream = new MyEventEmitter<MyStream>();

    constructor(private readonly peer: any, public readonly id: string) {
        if (peer._remoteStreams[0]) {
            this.onStream.emit({ stream: peer._remoteStreams[0] });
        }
        peer.on("stream", (stream: MediaStream) => {
            this.onStream.emit({ stream });
        });

        peer.on("data", (data: any) => {
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
