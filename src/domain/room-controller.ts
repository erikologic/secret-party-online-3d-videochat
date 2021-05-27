import { Local, Peer, RemoteRoom, VirtualWorld } from "./types";
import { Listener } from "../shared/my-event-emitter";

export class RoomController {
    constructor(
        private local: Local,
        private remoteRoom: RemoteRoom,
        private virtualWord: VirtualWorld
    ) {}

    async join(): Promise<void> {
        this.local.init();
        const localStream = await this.local.getLocalStream();
        await this.local.showLocalVideo();
        await this.remoteRoom.join();
        await this.remoteRoom.sendLocalStream(localStream);

        await this.virtualWord.start();
        this.virtualWord.onPositionUpdate.subscribe((pos) =>
            this.remoteRoom.broadcastLocalPosition(pos)
        );

        this.remoteRoom.onNewPeer.subscribe((peer) => this.createAvatar(peer));
        await this.remoteRoom
            .getPeers()
            .then((peers) =>
                Promise.allSettled(peers.map((peer) => this.createAvatar(peer)))
            );
    }

    private createAvatar: Listener<Peer> = async (peer) => {
        const avatar = this.virtualWord.createAvatar(peer.id);
        peer.onPositionUpdate.subscribe((pos) => avatar.moveTo(pos));

        const showVideo = async () => {
            const closeByDistance = 10;
            const distance = avatar.calcDistance();
            peer.onStream.subscribe((stream) => avatar.showVideo(stream));
            peer.onStream.subscribe((stream) => avatar.showAudio(stream));

            if (distance < closeByDistance) {
                await peer.showStream();
            } else {
                await peer.stopShowingStream();
            }
        };

        await showVideo();
        const disableShowVideo = setInterval(() => showVideo(), 1000);

        peer.onDisconnect.subscribe(async () => {
            await avatar.remove();
            peer.onPositionUpdate.unsubscribeAll();
            peer.onStream.unsubscribeAll();
            clearInterval(disableShowVideo);
        });
    };
}
