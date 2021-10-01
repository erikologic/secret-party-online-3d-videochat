import { Local, Peer, PeerConfig, RemoteRoom, VirtualWorld } from "./types";
import { Listener } from "../shared/my-event-emitter";

const closeByDistance = {
    audio: {
        peer: 25,
        tv: 50,
    },
    video: {
        peer: 10,
        tv: 25,
    },
} as const;

export class RoomController {
    private _config: PeerConfig | undefined;
    get config(): PeerConfig {
        if (!this._config) throw new Error("config unaccesible");
        return this._config;
    }

    constructor(
        private local: Local,
        private remoteRoom: RemoteRoom,
        private virtualWord: VirtualWorld
    ) {}

    async join(): Promise<void> {
        this.local.init();
        this._config = this.local.getConfig();
        const localStream =
            this.config.type === "tv"
                ? await this.local.getDesktopStream()
                : await this.local.getLocalStream();
        await this.local.showLocalVideo();
        await this.remoteRoom.join();
        await this.remoteRoom.sendLocalStream(localStream);

        await this.virtualWord.start();
        this.virtualWord.setType(this.config.type);

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
        console.log(`PEER ID ${peer.id} --> Subscribing avatar to streams`);
        peer.onStream.subscribe((stream) => avatar.showVideo(stream));
        peer.onStream.subscribe((stream) => avatar.showAudio(stream));

        let peerConfig: PeerConfig | undefined; // TODO  not nice - prob this fn needs a class
        peer.onConfig.subscribe(async (config) => {
            console.log(`PEER ID ${peer.id} --> Got config: ${config.name}`);
            avatar.setColor(config.color);
            avatar.setName(config.name);
            avatar.setType(config.type);
            peerConfig = config;
        });

        setTimeout(() => {
            peer.sendConfig(this.local.getConfig());
        }, 2_000);

        const showAudioVideo = async () => {
            if (!(peerConfig?.type === "peer")) {
                console.log(
                    `PEER ID ${peer.id} --> do not showAudioVideo`,
                    peerConfig
                );
                return;
            }

            const distance = avatar.calcDistance();
            const angle = Math.abs(avatar.calcAngle());
            const videoCutOffAngle = 90;
            if (
                distance < closeByDistance.video[this.config.type] &&
                angle < videoCutOffAngle
            ) {
                await peer.showVideoStream();
            } else {
                await peer.stopShowingVideoStream();
            }

            if (distance < closeByDistance.audio[this.config.type]) {
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
