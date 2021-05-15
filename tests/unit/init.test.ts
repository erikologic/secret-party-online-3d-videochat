import { Local, RemoteRoom, Room } from "../../src/init";

describe("when entering a room", () => {
    const remoteRoom: RemoteRoom = {
        join: jest.fn().mockResolvedValue(undefined),
    };

    const local: Local = {
        getWebcamStream: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const room = new Room(local, remoteRoom);
        await room.join("aRoom");
    });

    it("gets the local webcam video stream", async () => {
        expect(local.getWebcamStream).toHaveBeenCalled();
    });

    it("join remote room", async () => {
        expect(remoteRoom.join).toHaveBeenCalled();
    });
});
