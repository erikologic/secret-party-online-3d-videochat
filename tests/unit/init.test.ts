import {
    Local,
    LocalMedia,
    Peer,
    RemoteMedia,
    RemoteRoom,
    Room,
    VirtualWorld,
} from "../../src/init";

describe("when entering a room", () => {
    const localMedia: LocalMedia = {
        media: undefined,
    };

    const remoteMedia: RemoteMedia = {
        media: undefined,
    };

    const peer: Peer = {
        getMedia: jest.fn().mockResolvedValue(remoteMedia),
        id: "aPeer",
    };

    const remoteRoom: RemoteRoom = {
        getPeers: jest.fn().mockResolvedValue([peer]),
        sendLocalMedia: jest.fn().mockResolvedValue(undefined),
        join: jest.fn().mockResolvedValue(undefined),
    };

    const local: Local = {
        showWebcamStream: jest.fn(),
        getWebcamStream: jest.fn().mockResolvedValue(localMedia),
    };

    const virtualWord: VirtualWorld = {
        start: jest.fn().mockResolvedValue(undefined),
        addPeer: jest.fn(),
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

    it("fetch other peers in the room", () => {
        expect(remoteRoom.getPeers).toHaveBeenCalled();
    });

    test("when a peer is found will create its avatar", () => {
        expect(virtualWord.addPeer).toHaveBeenCalledWith(peer);
    });

    test("when a peer is found will try fetch her media", () => {
        expect(peer.getMedia).toHaveBeenCalled();
    });

    test.todo("is using the right browser");
    test.todo("can get access to webcam");
    test.todo("fetch media for peer depending on distance");
    test.todo("syncs users known with users in the room");
});
