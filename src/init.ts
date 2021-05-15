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

        const peers = await this.remoteRoom.getPeers();
        const avatar = this.virtualWord.createAvatar();
        const remoteStream = await peers[0].getStream();
        avatar.showStream(remoteStream);
    }
}

export interface Local {
    showWebcamStream: () => void;
    getWebcamStream: () => Promise<LocalStream>;
}

export interface Peer {
    getStream: () => Promise<RemoteStream>;
    id: string;
}

export interface RemoteRoom {
    getPeers: () => Promise<Peer[]>;
    sendLocalStream: (localStream: LocalStream) => Promise<void>;
    join: () => Promise<void>;
}

export interface Avatar {
    showStream: (stream: Stream) => void;
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

export type RemoteStream = Stream;
