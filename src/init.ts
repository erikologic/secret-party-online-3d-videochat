export class Room {
    constructor(
        private local: Local,
        private remoteRoom: RemoteRoom,
        private virtualWord: VirtualWorld
    ) {}

    async join(_room: string): Promise<void> {
        const localMedia = await this.local.getWebcamStream();
        await this.local.showWebcamStream();
        await this.remoteRoom.join();
        const peers = await this.remoteRoom.getPeers();
        await peers[0].getMedia();
        await this.remoteRoom.sendLocalMedia(localMedia);
        await this.virtualWord.start();
    }
}

export interface Local {
    showWebcamStream: () => void;
    getWebcamStream: () => Promise<LocalMedia>;
}

export interface Peer {
    getMedia: () => Promise<RemoteMedia>;
    id: string;
}

export interface RemoteRoom {
    getPeers: () => Promise<Peer[]>;
    sendLocalMedia: (localMedia: LocalMedia) => Promise<void>;
    join: () => Promise<void>;
}

export interface VirtualWorld {
    start: () => Promise<void>;
}

interface Media {
    media: any;
}

export type LocalMedia = Media;

export type RemoteMedia = Media;
