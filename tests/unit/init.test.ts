import { Local, RemoteRoom, Room, VirtualWorld } from "../../src/init";

describe("when entering a room", () => {
    const remoteRoom: RemoteRoom = {
        join: jest.fn().mockResolvedValue(undefined),
    };

    const local: Local = {
        showWebcamStream: jest.fn(),
        getWebcamStream: jest.fn().mockResolvedValue(undefined),
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

    it("show the local webcam video to the user", async () => {
        expect(local.showWebcamStream).toHaveBeenCalled();
    });

    it("join remote room", async () => {
        expect(remoteRoom.join).toHaveBeenCalled();
    });

    it("spin up the virtual world", () => {
        expect(virtualWord.start).toHaveBeenCalled();
    });
});
