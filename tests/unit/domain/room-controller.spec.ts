import { RoomController } from "../../../src/domain/room-controller";
import { MyEventEmitter } from "../../../src/shared/myEventEmitter";
import {
    Avatar,
    Local,
    LocalAudio,
    LocalPosition,
    LocalVideo,
    Peer,
    PeerPosition,
    RemoteAudio,
    RemoteRoom,
    RemoteVideo,
    VirtualWorld,
} from "../../../src/domain/types";

describe("when entering a room", () => {
    const localAudio: LocalAudio = {};
    const localVideo: LocalVideo = {};
    const remoteAudio: RemoteAudio = {
        stream: {} as MediaStream,
    };
    const remoteVideo: RemoteVideo = {
        stream: {} as MediaStream,
    };
    const localPosition: LocalPosition = {
        absoluteRotation: {
            x: 0,
            y: 1,
            z: 2,
            w: 3,
        },
        globalPosition: {
            x: 4,
            y: 5,
            z: 6,
        },
    };
    const position: PeerPosition = {
        absoluteRotation: {
            x: 6,
            y: 5,
            z: 4,
            w: 3,
        },
        globalPosition: {
            x: 2,
            y: 1,
            z: 0,
        },
    };

    let peer: Peer;

    let remoteRoom: RemoteRoom;

    let local: Local;

    let avatar: Avatar;

    let virtualWord: VirtualWorld;

    beforeEach(async () => {
        peer = {
            id: "aPeer",
            getAudio: () => Promise.resolve(remoteAudio),
            getVideo: () => Promise.resolve(remoteVideo),
            onPositionUpdate: new MyEventEmitter(),
            onDisconnect: new MyEventEmitter(),
        };

        remoteRoom = {
            getPeers: jest.fn().mockResolvedValue([peer]),
            sendLocalAudio: jest.fn().mockResolvedValue(undefined),
            sendLocalVideo: jest.fn().mockResolvedValue(undefined),
            join: jest.fn().mockResolvedValue(undefined),
            broadcastLocalPosition: jest.fn(),
            onNewPeer: new MyEventEmitter(),
        };

        local = {
            showLocalWebcamVideo: jest.fn(),
            getLocalWebcamVideo: jest.fn().mockResolvedValue(localVideo),
            getLocalWebcamAudio: jest.fn().mockResolvedValue(localAudio),
        };

        avatar = {
            remove: jest.fn(),
            showVideo: jest.fn(),
            showAudio: jest.fn(),
            moveTo: jest.fn(),
        };

        virtualWord = {
            start: jest.fn().mockResolvedValue(undefined),
            createAvatar: jest.fn().mockReturnValue(avatar),
            onPositionUpdate: new MyEventEmitter(),
        };

        const room = new RoomController(local, remoteRoom, virtualWord);
        await room.join("aRoom");
    });

    describe("initialisation", () => {
        test.todo("is using the right browser");
        test.todo("can get access to webcam");

        it("join remote room", async () => {
            expect(remoteRoom.join).toHaveBeenCalled();
        });

        test.todo("cannot access remote room");

        it("show the local webcam video to the local user", async () => {
            expect(local.showLocalWebcamVideo).toHaveBeenCalled();
        });

        it("send local video to the other peers", () => {
            expect(remoteRoom.sendLocalVideo).toHaveBeenCalledWith(localVideo);
        });

        it("send local audio to the other peers", () => {
            expect(remoteRoom.sendLocalAudio).toHaveBeenCalledWith(localAudio);
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

        test("when several peers are found, creates an avatar for each peer found", async () => {
            jest.clearAllMocks();
            const fivePeers = Array(5).fill(peer);
            const getPeersMock = remoteRoom.getPeers as jest.Mock;
            getPeersMock.mockResolvedValue(fivePeers);

            const room = new RoomController(local, remoteRoom, virtualWord);
            await room.join("aRoom");

            expect(virtualWord.createAvatar).toHaveBeenCalledTimes(5);
        });

        test.todo(
            "sets the avatar configuration to the peer configuration when configuration is emitted"
        );

        test("when peer video is found will attach it to its avatar", () => {
            expect(avatar.showVideo).toHaveBeenCalledWith(remoteVideo);
        });
        test.todo("when fails attaching peer video");

        test("when peer audio is found will attach it to its avatar", () => {
            expect(avatar.showAudio).toHaveBeenCalledWith(remoteAudio);
        });
        test.todo("when fails attaching peer audio");

        test("when the peer moves, its avatar will move in the virtual world", () => {
            peer.onPositionUpdate.emit(position);
            expect(avatar.moveTo).toHaveBeenCalledWith(position);
        });
        test.todo("fetch peer video depending on distance");
        test.todo("fetch peer audio depending on distance");
    });

    test.todo("syncs users known with users in the room");

    test("local movements will be broadcast", async () => {
        await virtualWord.onPositionUpdate.emit(localPosition);
        expect(remoteRoom.broadcastLocalPosition).toHaveBeenCalledWith(
            localPosition
        );
    });

    test("when a new user will connect creates its avatar", async () => {
        const newPeer: Peer = {
            ...peer,
            id: "newPeer",
        };
        await remoteRoom.onNewPeer.emit(newPeer);
        expect(virtualWord.createAvatar).toHaveBeenCalledTimes(2);
    });

    describe("when a peer disconnect", () => {
        beforeEach(async () => {
            await peer.onDisconnect.emit();
        });

        it("removes the avatar", () => {
            expect(avatar.remove).toHaveBeenCalledTimes(1);
        });

        it("stops listening to peer events", async () => {
            await peer.onPositionUpdate.emit(position);
            expect(avatar.moveTo).not.toHaveBeenCalled();
        });
    });
});
