import { MyPosition, Peer, RemoteRoom, MyStream } from "../../domain/types";
import { MyEventEmitter } from "../../shared/my-event-emitter";
import swarm from "./webrtc-swarm";

/// <reference path="signalhub.d.ts"/>
import signalhub from "signalhub";
import { PeerSwarmSimplePeer } from "./peer";
import SimplePeer from "simple-peer";

export class RemoteRoomSwarmSignalHub implements RemoteRoom {
    private myPeers: PeerSwarmSimplePeer[] = [];
    onNewPeer = new MyEventEmitter<Peer>();
    private stream: MyStream | undefined;

    async join(): Promise<void> {
        const hub = signalhub("lets-party", [process.env.HUB_URL]);
        console.log(hub);
        const turnServer = process.env.TURN_IP;
        const sw = swarm(hub, {
            config: {
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: `stun:${turnServer}:3478` },
                    {
                        urls: `turn:${turnServer}:3478`,
                        username: "username1",
                        credential: "password1",
                    },
                ],
            },
        }) as any;

        sw.on("connect", (peer: SimplePeer.Instance, id: string) => {
            console.log("connected to a new peer:", peer, id);
            console.log("total peers:", sw.peers.length);
            const myPeer = new PeerSwarmSimplePeer(peer, id);
            this.myPeers.push(myPeer);
            this.onNewPeer.emit(myPeer);
            if (this.stream) myPeer.sendLocalStream(this.stream);
        });

        sw.on("disconnect", (peer: any, id: string) => {
            console.log("disconnected from a peer:", id);
            console.log("total peers:", sw.peers.length);
            const myPeer = this.findPeer(id);
            myPeer?.onDisconnect.emit();
        });
    }

    async getPeers(): Promise<Peer[]> {
        return this.myPeers;
    }

    async broadcastLocalPosition(localPosition: MyPosition): Promise<void> {
        await Promise.all(
            this.myPeers.map((myPeer) =>
                myPeer.sendLocalPosition(localPosition)
            )
        );
    }

    private findPeer(id: string): Peer | undefined {
        return this.myPeers.find((peer) => peer.id === id);
    }

    async sendLocalStream(stream: MyStream): Promise<void> {
        this.stream = stream;
        await Promise.all(
            this.myPeers.map((myPeer) => myPeer.sendLocalStream(stream))
        );
    }
}
