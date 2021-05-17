import { MyEventEmitter } from "./shared/myEventEmitter";

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
        this.virtualWord.onPositionUpdate =
            this.remoteRoom.broadcastLocalPosition;

        const peers = await this.remoteRoom.getPeers();
        for await (const peer of peers) {
            const avatar = this.virtualWord.createAvatar();
            avatar.setConfiguration(await peer.getConfiguration());
            peer.onPositionUpdate = avatar.moveTo;
            avatar.showVideo(await peer.getVideo());
            avatar.showAudio(await peer.getAudio());
        }
    }

    private createPeer = async (peer: Peer): Promise<void> => {
        const avatar = this.virtualWord.createAvatar();
        avatar.setConfiguration(await peer.getConfiguration());
        peer.onPositionUpdate = avatar.moveTo;
        avatar.showVideo(await peer.getVideo());
        avatar.showAudio(await peer.getAudio());
    };
}

export interface Local {
    showLocalWebcamVideo: () => void;
    getLocalWebcamVideo: () => Promise<LocalVideo>;
    getLocalWebcamAudio: () => Promise<LocalAudio>;
    getLocalConfiguration: () => LocalConfiguration;
}

export interface Peer {
    getAudio: () => Promise<RemoteAudio>;
    getVideo: () => Promise<RemoteVideo>;
    id: string;
    onPositionUpdate: (position: PeerPosition) => void;
    getConfiguration: () => Promise<PeerConfiguration>;
}

export interface RemoteRoom {
    broadcastLocalPosition: (localPosition: LocalPosition) => Promise<void>;
    setLocalConfiguration: (configuration: LocalConfiguration) => Promise<void>;
    getPeers: () => Promise<Peer[]>;
    sendLocalAudio: (localAudio: LocalAudio) => Promise<void>;
    sendLocalVideo: (localVideo: LocalVideo) => Promise<void>;
    join: () => Promise<void>;
    onNewPeer: MyEventEmitter<Peer>;
}

export interface Avatar {
    setConfiguration: (configuration: PeerConfiguration) => void;
    moveTo: (position: PeerPosition) => void;
    showVideo: (remoteVideo: RemoteVideo) => void;
    showAudio: (remoteAudio: RemoteAudio) => void;
}

export interface VirtualWorld {
    onPositionUpdate: (position: PeerPosition) => Promise<void>;
    createAvatar: () => Avatar;
    start: () => Promise<void>;
}

export type LocalAudio = {};
export type LocalVideo = {};
export type RemoteAudio = {};
export type RemoteVideo = {};

export type PeerPosition = {};
export type LocalPosition = {};

export interface LocalConfiguration {
    name: string;
}
export interface PeerConfiguration {
    name: string;
}
