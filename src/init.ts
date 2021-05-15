export class Room {
    constructor(
        private local: Local,
        private remoteRoom: RemoteRoom,
        private virtualWord: VirtualWorld
    ) {}

    async join(_room: string): Promise<void> {
        await this.local.getWebcamStream();
        await this.local.showWebcamStream();
        await this.remoteRoom.join();
        await this.virtualWord.start();
    }
}

export interface Local {
    showWebcamStream: () => void;
    getWebcamStream: () => Promise<void>;
}

export interface RemoteRoom {
    join: () => Promise<void>;
}

export interface VirtualWorld {
    start: () => Promise<void>;
}
