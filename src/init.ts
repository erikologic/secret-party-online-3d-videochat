export class Room {
    constructor(
        private local: Local,
        private remoteRoom: RemoteRoom,
        private virtualWord: VirtualWorld
    ) {}

    async join(_room: string): Promise<void> {
        const localStream = await this.local.getWebcamStream();
        await this.local.showWebcamStream();
        await this.remoteRoom.join();
        await this.remoteRoom.sendLocalStream(localStream);
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
    showWebcamStream: () => void;
    getWebcamStream: () => Promise<LocalStream>;
}

export interface Peer {
    getAudio: () => Promise<RemoteAudio>;
    getVideo: () => Promise<RemoteVideo>;
    id: string;
    onPositionUpdate: (position: PeerPosition) => void;
}

export interface RemoteRoom {
    getPeers: () => Promise<Peer[]>;
    sendLocalStream: (localStream: LocalStream) => Promise<void>;
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

interface Stream {
    stream: any;
}

export type LocalStream = Stream;

export type PeerPosition = {};

export type RemoteVideo = {};
export type RemoteAudio = {};
