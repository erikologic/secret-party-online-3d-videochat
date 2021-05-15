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
    }
}

export interface Local {
    showWebcamStream: () => void;
    getWebcamStream: () => Promise<LocalMedia>;
}

export interface RemoteRoom {
    sendLocalMedia: (localMedia: LocalMedia) => Promise<void>;
    join: () => Promise<void>;
}

export interface VirtualWorld {
    start: () => Promise<void>;
}

export interface LocalMedia {
    media: any;
}
