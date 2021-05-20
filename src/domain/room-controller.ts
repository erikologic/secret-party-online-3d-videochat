import { Local, Peer, RemoteRoom, VirtualWorld } from "./types";
import { Listener } from "../shared/myEventEmitter";

export class RoomController {
    constructor(
        private local: Local,
        private remoteRoom: RemoteRoom,
        private virtualWord: VirtualWorld
    ) {}

    async join(): Promise<void> {
        const localVideo = await this.local.getLocalWebcamVideo();
        await this.local.showLocalWebcamVideo();
        await this.remoteRoom.join();
        const localAudio = await this.local.getLocalWebcamAudio();
        await this.remoteRoom.sendLocalAudio(localAudio);
        await this.remoteRoom.sendLocalVideo(localVideo);
        this.remoteRoom.onNewPeer.subscribe(this.createPeer);

        await this.virtualWord.start();
        this.virtualWord.onPositionUpdate.subscribe(
            this.remoteRoom.broadcastLocalPosition
        );

        await this.remoteRoom
            .getPeers()
            .then((peers) => Promise.allSettled(peers.map(this.createPeer)));
    }

    private createPeer: Listener<Peer> = async (peer) => {
        const avatar = this.virtualWord.createAvatar(peer.id);
        peer.onPositionUpdate.subscribe(avatar.moveTo);
        peer.onVideoStream.subscribe(avatar.showVideo);
        peer.onAudioStream.subscribe(avatar.showAudio);

        peer.onDisconnect.subscribe(async () => {
            await avatar.remove();
            peer.onPositionUpdate.unsubscribeAll();
        });
    };
}
