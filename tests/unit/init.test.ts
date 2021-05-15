import {
    Local,
    LocalMedia,
    RemoteRoom,
    Room,
    VirtualWorld,
} from "../../src/init";

describe("when entering a room", () => {
    const localMedia: LocalMedia = {
        media: undefined,
    };

    const remoteRoom: RemoteRoom = {
        sendLocalMedia: jest.fn().mockResolvedValue(undefined),
        join: jest.fn().mockResolvedValue(undefined),
    };

    const local: Local = {
        showWebcamStream: jest.fn(),
        getWebcamStream: jest.fn().mockResolvedValue(localMedia),
    };

    const virtualWord: VirtualWorld = {
        start: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const room = new Room(local, remoteRoom, virtualWord);
        await room.join("aRoom");
    });

    it("gets the local webcam video stream", async () => {
        expect(local.getWebcamStream).toHaveBeenCalled();
    });

    it("show the local webcam video to the local user", async () => {
        expect(local.showWebcamStream).toHaveBeenCalled();
    });

    it("join remote room", async () => {
        expect(remoteRoom.join).toHaveBeenCalled();
    });

    it("send local media to the remoteRoom", () => {
        expect(remoteRoom.sendLocalMedia).toHaveBeenCalledWith(localMedia);
    });

    it("spin up the virtual world", () => {
        expect(virtualWord.start).toHaveBeenCalled();
    });
});
