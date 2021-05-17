import { Local, Peer, RemoteRoom, VirtualWorld } from "./domain/types";

export class Room {
    constructor(
        private local: Local,
        private remoteRoom: RemoteRoom,
        private virtualWord: VirtualWorld
    ) {}

    async join(_room: string): Promise<void> {
        const localVideo = await this.local.getLocalWebcamVideo();
        await this.local.showLocalWebcamVideo();
        await this.remoteRoom.join();
        const localConfiguration = await this.local.getLocalConfiguration();
        await this.remoteRoom.setLocalConfiguration(localConfiguration);
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

    private createPeer = async (peer: Peer): Promise<void> => {
        const avatar = this.virtualWord.createAvatar();
        avatar.setConfiguration(await peer.getConfiguration());
        peer.onPositionUpdate = avatar.moveTo;
        avatar.showVideo(await peer.getVideo());
        avatar.showAudio(await peer.getAudio());
    };
}
