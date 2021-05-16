import {
    Avatar,
    Local,
    LocalStream,
    Peer,
    RemoteRoom,
    Room,
    VirtualWorld,
    PeerPosition,
    RemoteVideo,
    RemoteAudio,
} from "../../src/init";

describe("when entering a room", () => {
    const remoteAudio: RemoteAudio = {};

    const localStream: LocalStream = {
        stream: undefined,
    };

    const remoteVideo: RemoteVideo = {};

    const peer: Peer = {
        getAudio: jest.fn().mockResolvedValue(remoteAudio),
        getVideo: jest.fn().mockResolvedValue(remoteVideo),
        id: "aPeer",
        onPositionUpdate: () => {
            throw new Error("not implemented");
        },
    };

    const remoteRoom: RemoteRoom = {
        getPeers: jest.fn().mockResolvedValue([peer]),
        sendLocalStream: jest.fn().mockResolvedValue(undefined),
        join: jest.fn().mockResolvedValue(undefined),
    };

    const local: Local = {
        showWebcamStream: jest.fn(),
        getWebcamStream: jest.fn().mockResolvedValue(localStream),
    };

    const avatar: Avatar = {
        _id: "",
        showVideo: jest.fn(),
        showAudio: jest.fn(),
        moveTo: jest.fn(),
    };

    const virtualWord: VirtualWorld = {
        start: jest.fn().mockResolvedValue(undefined),
        createAvatar: jest.fn().mockReturnValue(avatar),
    };

    beforeEach(async () => {
        const room = new Room(local, remoteRoom, virtualWord);
        await room.join("aRoom");
    });

    describe("initialisation", () => {
        test.todo("is using the right browser");
        test.todo("can get access to webcam");

        it("gets the local webcam video stream", async () => {
            expect(local.getWebcamStream).toHaveBeenCalled();
        });

        it("join remote room", async () => {
            expect(remoteRoom.join).toHaveBeenCalled();
        });

        test.todo("cannot access remote room");

        it("show the local webcam video to the local user", async () => {
            expect(local.showWebcamStream).toHaveBeenCalled();
        });

        it("send local stream to the remoteRoom", () => {
            expect(remoteRoom.sendLocalStream).toHaveBeenCalledWith(
                localStream
            );
        });

        it("spin up the virtual world", () => {
            expect(virtualWord.start).toHaveBeenCalled();
        });

        it("fetch other peers in the room", () => {
            expect(remoteRoom.getPeers).toHaveBeenCalled();
        });
    });

    describe("connecting to other peers", () => {
        test("when a peer is found will create its avatar", () => {
            expect(virtualWord.createAvatar).toHaveBeenCalled();
        });

        test("when a peer is found will try fetch her video", () => {
            expect(peer.getVideo).toHaveBeenCalled();
        });
        test.todo("when fails fetching peer video");

        test("when peer video is found will attach it to its avatar", () => {
            expect(avatar.showVideo).toHaveBeenCalledWith(remoteVideo);
        });
        test.todo("when fails attaching peer video");

        test("when a peer is found will try fetch her audio", () => {
            expect(peer.getAudio).toHaveBeenCalled();
        });
        test.todo("when fails fetching peer audio");

        test("when peer audio is found will attach it to its avatar", () => {
            expect(avatar.showAudio).toHaveBeenCalledWith(remoteAudio);
        });
        test.todo("when fails attaching peer stream");

        test("when the peer moves, its avatar will move in the virtual world", () => {
            const position: PeerPosition = {};
            peer.onPositionUpdate(position);
            expect(avatar.moveTo).toHaveBeenCalledWith(position);
        });
        test.todo("fetch peer stream for peer depending on distance");
    });

    test.todo("syncs users known with users in the room");
    test.todo("when I move it will broadcast the movements");
});
