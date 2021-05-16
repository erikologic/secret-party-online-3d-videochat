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
        await this.virtualWord.start();

        const [peer] = await this.remoteRoom.getPeers();
        const avatar = this.virtualWord.createAvatar();
        peer.onPositionUpdate = avatar.moveTo;
        const remoteVideo = await peer.getVideo();
        avatar.showVideo(remoteVideo);
        const remoteAudio = await peer.getAudio();
        avatar.showAudio(remoteAudio);
    }
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
}

export interface RemoteRoom {
    setLocalConfiguration: (configuration: LocalConfiguration) => Promise<void>;
    getPeers: () => Promise<Peer[]>;
    sendLocalAudio: (localAudio: LocalAudio) => Promise<void>;
    sendLocalVideo: (localVideo: LocalVideo) => Promise<void>;
    join: () => Promise<void>;
}

export interface Avatar {
    moveTo: (position: PeerPosition) => void;
    showVideo: (remoteVideo: RemoteVideo) => void;
    showAudio: (remoteAudio: RemoteAudio) => void;
    _id: string;
}

export interface VirtualWorld {
    createAvatar: () => Avatar;
    start: () => Promise<void>;
}

export type LocalAudio = {};
export type LocalVideo = {};
export type RemoteAudio = {};
export type RemoteVideo = {};

export type PeerPosition = {};

export interface LocalConfiguration {
    name: string;
}
