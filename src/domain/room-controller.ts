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
        peer.onStream.subscribe((stream) => avatar.showVideo(stream));
        peer.onStream.subscribe((stream) => avatar.showAudio(stream));

        const showAudioVideo = async () => {
            const distance = avatar.calcDistance();
            const angle = avatar.calcAngle();
            const videoCloseByDistance = 10;
            const videoCutOffAngle = 90;
            if (distance < videoCloseByDistance && angle < videoCutOffAngle) {
                await peer.showVideoStream();
            } else {
                await peer.stopShowingVideoStream();
            }

            const audioCloseByDistance = 25;
            if (distance < audioCloseByDistance) {
                await peer.showAudioStream();
            } else {
                await peer.stopShowingAudioStream();
            }
        };

        const disableShowAudioVideo = setInterval(() => showAudioVideo(), 1000);

        peer.onDisconnect.subscribe(async () => {
            await avatar.remove();
            peer.onPositionUpdate.unsubscribeAll();
            peer.onStream.unsubscribeAll();
            clearInterval(disableShowAudioVideo);
        });
    };
}
