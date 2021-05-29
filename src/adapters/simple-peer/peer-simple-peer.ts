import { MyPosition, MyStream, Peer, PeerConfig } from "../../domain/types";
import { MyEventEmitter } from "../../shared/my-event-emitter";
import { deserializer } from "./de-serializer/deserializer";
import SimplePeer from "simple-peer";
import { Command } from "./de-serializer/types";
import {
    configSerializer,
    positionSerializer,
} from "./de-serializer/serializer";

export class PeerSimplePeer implements Peer {
    onDisconnect = new MyEventEmitter<void>();
    onPositionUpdate = new MyEventEmitter<MyPosition>();
    onStream = new MyEventEmitter<MyStream>();
    onConfig = new MyEventEmitter<PeerConfig>();

    private myStream: MyStream | undefined;
    private clonedStream: MediaStream | undefined;

    constructor(
        private readonly peer: SimplePeer.Instance,
        public readonly id: string
    ) {
        peer.on("stream", async (stream: MediaStream) => {
            await this.onStream.emit({ stream });
        });

        peer.on("data", async (data: ArrayBufferLike) => {
            const deserializedData = deserializer(data);
            if (deserializedData.type === Command.Position) {
                await this.onPositionUpdate.emit(deserializedData.payload);
            }
            if (deserializedData.type === Command.Configuration) {
                await this.onConfig.emit(deserializedData.payload);
            }
        });

        peer.on("close", async () => {
            await this.onDisconnect.emit();
        });
    }

    async sendLocalPosition(localPosition: MyPosition): Promise<void> {
        const data: ArrayBuffer = positionSerializer(localPosition);
        this.peer.send(data);
    }

    async sendLocalStream(myStream: MyStream): Promise<void> {
        this.myStream = myStream;
        this.clonedStream = myStream.stream.clone();

        this.peer.addStream(this.clonedStream);
        this.clonedStream.getVideoTracks()[0].enabled = false;
        this.clonedStream.getAudioTracks()[0].enabled = false;
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

    async showAudioStream(): Promise<void> {
        if (!this.clonedStream) throw new Error("no stream available to send");
        this.clonedStream.getAudioTracks()[0].enabled = true;
    }

    async stopShowingAudioStream(): Promise<void> {
        if (!this.clonedStream)
            throw new Error("no stream available to stop sending");
        this.clonedStream.getAudioTracks()[0].enabled = false;
    }

    async sendConfig(config: PeerConfig): Promise<void> {
        console.log({ config });
        const data: ArrayBuffer = configSerializer(config);
        this.peer.send(data);
    }
}
