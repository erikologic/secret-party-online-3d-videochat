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
        await this.remoteRoom.sendLocalMedia(localMedia);
        await this.virtualWord.start();

        const peers = await this.remoteRoom.getPeers();
        this.virtualWord.addPeer(peers[0]);
        await peers[0].getMedia();
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
    addPeer: (peer: Peer) => void;
    start: () => Promise<void>;
}

interface Media {
    media: any;
}

export type LocalMedia = Media;

export type RemoteMedia = Media;
