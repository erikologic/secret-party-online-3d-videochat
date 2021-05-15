export class Room {
    constructor(private local: Local, private remoteRoom: RemoteRoom) {
    }

    async join(_room: string) {
        await this.local.getWebcamStream();
        await this.remoteRoom.join();
    }
}

export interface Local {
    getWebcamStream: () => Promise<void>;
}

export interface RemoteRoom {
    join: () => Promise<void>;
}