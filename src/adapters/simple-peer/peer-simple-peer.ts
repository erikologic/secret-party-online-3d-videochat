import { Peer, MyStream, MyPosition } from "../../domain/types";
import { MyEventEmitter } from "../../shared/my-event-emitter";
import { deserializer, serializer } from "./de-serializer";
import SimplePeer from "simple-peer";

export class PeerSimplePeer implements Peer {
    onDisconnect = new MyEventEmitter<void>();
    onPositionUpdate = new MyEventEmitter<MyPosition>();
    onStream = new MyEventEmitter<MyStream>();
    private myStream: MyStream | undefined;
    private clonedStream: MediaStream | undefined;

    constructor(
        private readonly peer: SimplePeer.Instance,
        public readonly id: string
    ) {
        peer.on("stream", async (stream: MediaStream) => {
            await this.onStream.emit({ stream });
        });

        peer.on("data", async (data: unknown) => {
            const position = deserializer(data);
            await this.onPositionUpdate.emit(position);
        });

        peer.on("close", async () => {
            await this.onDisconnect.emit();
        });
    }

    async sendLocalPosition(localPosition: MyPosition): Promise<void> {
        const data: ArrayBuffer = serializer(localPosition);
        this.peer.send(data);
    }

    async sendLocalStream(myStream: MyStream): Promise<void> {
        this.myStream = myStream;
        this.clonedStream = myStream.stream.clone();
        this.peer.addStream(this.clonedStream);
        this.clonedStream.getVideoTracks()[0].enabled = false;
    }

    async showVideoStream(): Promise<void> {
        if (!this.clonedStream) throw new Error("no stream available to send");
        this.clonedStream.getVideoTracks()[0].enabled = true;
    }

    async stopShowingVideoStream(): Promise<void> {
        if (!this.clonedStream)
            throw new Error("no stream available to stop sending");
        this.clonedStream.getVideoTracks()[0].enabled = false;
    }
}
