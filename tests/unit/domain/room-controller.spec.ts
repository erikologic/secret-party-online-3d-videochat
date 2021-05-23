import { RoomController } from "../../../src/domain/room-controller";
import { MyEventEmitter } from "../../../src/shared/my-event-emitter";
import {
    Avatar,
    Local,
    Peer,
    MyPosition,
    RemoteRoom,
    MyStream,
    VirtualWorld,
} from "../../../src/domain/types";

jest.useFakeTimers();

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe("when entering a room", () => {
    const myStream: MyStream = {
        stream: {} as MediaStream,
    };
    const position: MyPosition = {
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

    let peer: Peer;

    let remoteRoom: RemoteRoom;

    let local: Local;

    let avatar: Avatar;

    let virtualWord: VirtualWorld;

    beforeEach(async () => {
        jest.clearAllMocks();
        peer = {
            fetchStream: jest
                .fn()
                .mockImplementation(() => peer.onStream.emit(myStream)),
            onStream: new MyEventEmitter(),
            stopFetchingStream: jest.fn(),
            id: "aPeer",
            onPositionUpdate: new MyEventEmitter(),
            onDisconnect: new MyEventEmitter(),
        };

        remoteRoom = {
            getPeers: jest.fn().mockResolvedValue([peer]),
            sendLocalStream: jest.fn().mockResolvedValue(undefined),
            join: jest.fn().mockResolvedValue(undefined),
            broadcastLocalPosition: jest.fn(),
            onNewPeer: new MyEventEmitter(),
        };

        local = {
            init: jest.fn(),
            showLocalVideo: jest.fn(),
            getLocalStream: jest.fn().mockResolvedValue(myStream),
        };

        avatar = {
            stopAudio: jest.fn(),
            stopVideo: jest.fn(),
            calcDistance: jest.fn(),
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
        await room.join();
    });

    describe("initialisation", () => {
        test("initialise the local env", () => {
            expect(local.init).toHaveBeenCalled();
        });

        it("join remote room", async () => {
            expect(remoteRoom.join).toHaveBeenCalled();
        });

        test.todo("cannot access remote room");

        it("show the local webcam video to the local user", async () => {
            expect(local.showLocalVideo).toHaveBeenCalled();
        });

        it("send local webcam AV to the other peers", () => {
            expect(remoteRoom.sendLocalStream).toHaveBeenCalledWith(myStream);
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
            await room.join();

            expect(virtualWord.createAvatar).toHaveBeenCalledTimes(5);
        });

        test.todo(
            "sets the avatar configuration to the peer configuration when configuration is emitted"
        );

        describe("connecting to the stream", () => {
            const closeByDistance = 10;

            test("will regularly check the avatar position", () => {
                expect(avatar.calcDistance).toHaveBeenCalledTimes(1);
                (avatar.calcDistance as jest.Mock).mockReturnValue(5);
                jest.advanceTimersByTime(1000);
                expect(avatar.calcDistance).toHaveBeenCalledTimes(2);
                jest.advanceTimersByTime(1000);
                expect(avatar.calcDistance).toHaveBeenCalledTimes(3);
            });

            describe("when peer is close by", () => {
                beforeEach(async () => {
                    jest.clearAllMocks();

                    (avatar.calcDistance as jest.Mock).mockReturnValue(
                        closeByDistance - 5
                    );

                    const room = new RoomController(
                        local,
                        remoteRoom,
                        virtualWord
                    );
                    await room.join();
                });

                test("shows the peer stream when is close by", async () => {
                    expect(avatar.showVideo).toHaveBeenCalledWith(myStream);
                    expect(avatar.showAudio).toHaveBeenCalledWith(myStream);
                });

                test("stops showing the stream when the peer goes away", async () => {
                    (avatar.calcDistance as jest.Mock).mockReturnValue(
                        closeByDistance + 5
                    );
                    jest.advanceTimersByTime(1200);
                    await flushPromises();

                    expect(avatar.stopVideo).toHaveBeenCalled();
                    expect(avatar.stopAudio).toHaveBeenCalled();
                    expect(peer.stopFetchingStream).toHaveBeenCalled();
                });
            });

            describe("when peer is not close by", () => {
                beforeEach(async () => {
                    jest.clearAllMocks();

                    (avatar.calcDistance as jest.Mock).mockReturnValue(
                        closeByDistance + 5
                    );

                    const room = new RoomController(
                        local,
                        remoteRoom,
                        virtualWord
                    );
                    await room.join();
                });

                test("do not shows the peer stream when is not close by", async () => {
                    expect(avatar.showVideo).not.toBeCalled();
                    expect(avatar.showAudio).not.toBeCalled();
                });

                test("starts showing the stream when the peer gets close by", async () => {
                    (avatar.calcDistance as jest.Mock).mockReturnValue(
                        closeByDistance - 5
                    );
                    jest.advanceTimersByTime(1200);
                    await flushPromises();

                    expect(avatar.showVideo).toHaveBeenCalledWith(myStream);
                    expect(avatar.showAudio).toHaveBeenCalledWith(myStream);
                });
            });

            test.todo("when fails attaching peer stream");
        });

        test("when the peer moves, its avatar will move in the virtual world", () => {
            peer.onPositionUpdate.emit(position);
            expect(avatar.moveTo).toHaveBeenCalledWith(position);
        });
    });

    test.todo("syncs users known with users in the room");

    test("local movements will be broadcast", async () => {
        await virtualWord.onPositionUpdate.emit(position);
        expect(remoteRoom.broadcastLocalPosition).toHaveBeenCalledWith(
            position
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

        it("stops listening to peer position updates", async () => {
            await peer.onPositionUpdate.emit(position);
            expect(avatar.moveTo).not.toHaveBeenCalled();
        });

        it("stops getting the distance", () => {
            jest.clearAllMocks();
            jest.advanceTimersByTime(1200);
            expect(avatar.calcDistance).not.toHaveBeenCalled();
        });
    });
});
