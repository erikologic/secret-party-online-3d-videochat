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
            showVideoStream: jest.fn(),
            onStream: new MyEventEmitter(),
            stopShowingVideoStream: jest.fn(),
            id: "aPeer",
            onPositionUpdate: new MyEventEmitter(),
            onDisconnect: new MyEventEmitter(),
            showAudioStream: jest.fn(),
            stopShowingAudioStream: jest.fn(),
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
            calcDistance: jest.fn().mockReturnValue(1),
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
            test.todo("when fails attaching peer stream");

            test("will regularly check the avatar position", () => {
                jest.advanceTimersByTime(1000);
                expect(avatar.calcDistance).toHaveBeenCalledTimes(1);
                jest.advanceTimersByTime(1000);
                expect(avatar.calcDistance).toHaveBeenCalledTimes(2);
                jest.advanceTimersByTime(1000);
                expect(avatar.calcDistance).toHaveBeenCalledTimes(3);
            });

            test("when remote streams is available will be showed on the avatar", () => {
                peer.onStream.emit(myStream);
                expect(avatar.showVideo).toHaveBeenCalledWith(myStream);
                expect(avatar.showAudio).toHaveBeenCalledWith(myStream);
            });

            describe("for video streams", () => {
                const videoCutOffDistance = 10;

                test("shows the peer video stream when is close by", async () => {
                    jest.advanceTimersByTime(1000);
                    expect(peer.showVideoStream).toHaveBeenCalledTimes(1);
                });

                test("stops showing the video stream when the peer goes away", async () => {
                    jest.advanceTimersByTime(1000);
                    expect(peer.showVideoStream).toHaveBeenCalledTimes(1);

                    (avatar.calcDistance as jest.Mock).mockReturnValue(
                        videoCutOffDistance + 5
                    );
                    jest.advanceTimersByTime(1000);

                    expect(peer.stopShowingVideoStream).toHaveBeenCalledTimes(
                        1
                    );
                });

                test("shows the video stream when the peer gets close by again", async () => {
                    jest.advanceTimersByTime(1000);
                    expect(peer.showVideoStream).toHaveBeenCalledTimes(1);

                    (avatar.calcDistance as jest.Mock).mockReturnValue(
                        videoCutOffDistance + 5
                    );
                    jest.advanceTimersByTime(1000);
                    expect(peer.stopShowingVideoStream).toHaveBeenCalled();

                    (avatar.calcDistance as jest.Mock).mockReturnValue(
                        videoCutOffDistance - 5
                    );
                    jest.advanceTimersByTime(1000);
                    expect(peer.showVideoStream).toHaveBeenCalledTimes(2);
                });
            });
            describe("for audio streams", () => {
                const audioCutOffDistance = 25;

                test("shows the peer audio stream when is close by", async () => {
                    jest.advanceTimersByTime(1000);
                    expect(peer.showAudioStream).toHaveBeenCalledTimes(1);
                });

                test("stops showing the audio stream when the peer goes away", async () => {
                    jest.advanceTimersByTime(1000);
                    expect(peer.showAudioStream).toHaveBeenCalledTimes(1);

                    (avatar.calcDistance as jest.Mock).mockReturnValue(
                        audioCutOffDistance + 5
                    );
                    jest.advanceTimersByTime(1000);

                    expect(peer.stopShowingAudioStream).toHaveBeenCalledTimes(
                        1
                    );
                });

                test("shows the audio stream when the peer gets close by again", async () => {
                    jest.advanceTimersByTime(1000);
                    expect(peer.showAudioStream).toHaveBeenCalledTimes(1);

                    (avatar.calcDistance as jest.Mock).mockReturnValue(
                        audioCutOffDistance + 5
                    );
                    jest.advanceTimersByTime(1000);
                    expect(peer.stopShowingAudioStream).toHaveBeenCalled();

                    (avatar.calcDistance as jest.Mock).mockReturnValue(
                        audioCutOffDistance - 5
                    );
                    jest.advanceTimersByTime(1000);
                    expect(peer.showAudioStream).toHaveBeenCalledTimes(2);
                });
            });
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
