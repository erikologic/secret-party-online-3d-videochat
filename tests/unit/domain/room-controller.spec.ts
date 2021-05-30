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
    PeerConfig,
} from "../../../src/domain/types";

jest.useFakeTimers();

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const asMock = <T extends (...args: any) => any>(fn: T) =>
    fn as unknown as jest.Mock<ReturnType<T>, Parameters<T>>;

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
    const myConfig: PeerConfig = {
        color: "ff11bb",
        name: "myP33r",
        type: "peer",
    };

    let peer: Peer;

    let remoteRoom: RemoteRoom;

    let local: Local;

    let avatar: Avatar;

    let virtualWorld: VirtualWorld;

    beforeEach(async () => {
        jest.clearAllMocks();
        peer = {
            id: "aPeer",
            onConfig: new MyEventEmitter(),
            sendConfig: jest.fn(),
            onDisconnect: new MyEventEmitter(),
            onPositionUpdate: new MyEventEmitter(),
            onStream: new MyEventEmitter(),
            showVideoStream: jest.fn(),
            stopShowingVideoStream: jest.fn(),
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
            getDesktopStream: jest.fn().mockResolvedValue(myStream),
            getConfig: jest.fn().mockReturnValue(myConfig),
        };

        avatar = {
            setType: jest.fn(),
            setColor: jest.fn(),
            setName: jest.fn(),
            calcAngle: jest.fn().mockReturnValue(5),
            calcDistance: jest.fn().mockReturnValue(1),
            remove: jest.fn(),
            showVideo: jest.fn(),
            showAudio: jest.fn(),
            moveTo: jest.fn(),
        };

        virtualWorld = {
            start: jest.fn().mockResolvedValue(undefined),
            createAvatar: jest.fn().mockReturnValue(avatar),
            onPositionUpdate: new MyEventEmitter(),
            setType: jest.fn(),
        };
    });

    describe("given I am a normal peer", () => {
        beforeEach(async () => {
            const room = new RoomController(local, remoteRoom, virtualWorld);
            await room.join();

            await flushPromises();
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
                expect(remoteRoom.sendLocalStream).toHaveBeenCalledWith(
                    myStream
                );
            });

            it("spin up the virtual world", () => {
                expect(virtualWorld.start).toHaveBeenCalled();
            });

            it("fetch other peers in the room", () => {
                expect(remoteRoom.getPeers).toHaveBeenCalled();
            });
        });

        describe("connecting to other peers", () => {
            test("when a peer is found will create its avatar", () => {
                expect(virtualWorld.createAvatar).toHaveBeenCalled();
            });

            test("when several peers are found, creates an avatar for each peer found", async () => {
                jest.clearAllMocks();
                const fivePeers = Array(5).fill(peer);
                asMock(remoteRoom.getPeers).mockResolvedValue(fivePeers);

                const room = new RoomController(
                    local,
                    remoteRoom,
                    virtualWorld
                );
                await room.join();

                expect(virtualWorld.createAvatar).toHaveBeenCalledTimes(5);
            });

            describe("when peer provides a configuration", () => {
                beforeEach(() => {
                    peer.onConfig.emit({
                        color: "e66465",
                        name: "l0rdP33r",
                        type: "peer",
                    });
                });

                test("sets the avatar color", () => {
                    expect(avatar.setColor).toHaveBeenCalledWith("e66465");
                });

                test("sets the avatar name", () => {
                    expect(avatar.setName).toHaveBeenCalledWith("l0rdP33r");
                });

                test("send my configuration", async () => {
                    jest.advanceTimersByTime(2000);
                    expect(peer.sendConfig).toHaveBeenCalledWith(myConfig);
                });
            });

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
                    const angleCutOff = 90;

                    test("shows the peer video stream when is front of me", async () => {
                        jest.advanceTimersByTime(1000);
                        expect(peer.showVideoStream).toHaveBeenCalledTimes(1);
                    });

                    test("stops showing the video stream when the peer goes away", async () => {
                        jest.advanceTimersByTime(1000);
                        expect(peer.showVideoStream).toHaveBeenCalledTimes(1);

                        asMock(avatar.calcDistance).mockReturnValue(
                            videoCutOffDistance + 5
                        );
                        jest.advanceTimersByTime(1000);

                        expect(
                            peer.stopShowingVideoStream
                        ).toHaveBeenCalledTimes(1);
                    });

                    test("stops showing the video stream when the peer goes too much on the side", async () => {
                        jest.advanceTimersByTime(1000);
                        expect(peer.showVideoStream).toHaveBeenCalledTimes(1);

                        asMock(avatar.calcAngle).mockReturnValue(
                            angleCutOff + 5
                        );
                        jest.advanceTimersByTime(1000);

                        expect(
                            peer.stopShowingVideoStream
                        ).toHaveBeenCalledTimes(1);
                    });

                    test("shows the video stream when the peer gets in front of me again", async () => {
                        jest.advanceTimersByTime(1000);
                        expect(peer.showVideoStream).toHaveBeenCalledTimes(1);

                        asMock(avatar.calcDistance).mockReturnValue(
                            videoCutOffDistance + 5
                        );
                        jest.advanceTimersByTime(1000);
                        expect(peer.stopShowingVideoStream).toHaveBeenCalled();

                        asMock(avatar.calcDistance).mockReturnValue(
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
                        await flushPromises();

                        expect(peer.showAudioStream).toHaveBeenCalledTimes(1);
                    });

                    test("stops showing the audio stream when the peer goes away", async () => {
                        jest.advanceTimersByTime(1000);
                        await flushPromises();
                        expect(peer.showAudioStream).toHaveBeenCalledTimes(1);

                        asMock(avatar.calcDistance).mockReturnValue(
                            audioCutOffDistance + 5
                        );
                        jest.advanceTimersByTime(1000);
                        await flushPromises();
                        expect(
                            peer.stopShowingAudioStream
                        ).toHaveBeenCalledTimes(1);
                    });

                    test("shows the audio stream when the peer gets close by again", async () => {
                        jest.advanceTimersByTime(1000);
                        await flushPromises();

                        expect(peer.showAudioStream).toHaveBeenCalledTimes(1);

                        asMock(avatar.calcDistance).mockReturnValue(
                            audioCutOffDistance + 5
                        );
                        jest.advanceTimersByTime(1000);
                        await flushPromises();
                        expect(peer.stopShowingAudioStream).toHaveBeenCalled();

                        asMock(avatar.calcDistance).mockReturnValue(
                            audioCutOffDistance - 5
                        );
                        jest.advanceTimersByTime(1000);
                        await flushPromises();
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
            await virtualWorld.onPositionUpdate.emit(position);
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
            expect(virtualWorld.createAvatar).toHaveBeenCalledTimes(2);
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

    describe("given I am a TV", () => {
        beforeEach(async () => {
            asMock(local.getConfig).mockReturnValue({
                ...myConfig,
                type: "tv",
            });

            const room = new RoomController(local, remoteRoom, virtualWorld);
            await room.join();

            await flushPromises();
        });

        test("uses the desktop feed instead of the webcam one", async () => {
            expect(local.getDesktopStream).toHaveBeenCalled();
            expect(local.getLocalStream).not.toHaveBeenCalled();
        });

        test("video reaches further away", () => {
            const desktopVideoCutOffDistance = 25;

            jest.advanceTimersByTime(1000);
            expect(peer.showVideoStream).toHaveBeenCalledTimes(1);

            asMock(avatar.calcDistance).mockReturnValue(
                desktopVideoCutOffDistance - 5
            );
            jest.advanceTimersByTime(1000);
            expect(peer.showVideoStream).toHaveBeenCalledTimes(2);

            asMock(avatar.calcDistance).mockReturnValue(
                desktopVideoCutOffDistance + 5
            );
            jest.advanceTimersByTime(1000);
            expect(peer.stopShowingVideoStream).toHaveBeenCalledTimes(1);
        });

        test("audio reaches further away", async () => {
            const desktopAudioCutOffDistance = 50;

            jest.advanceTimersByTime(1000);
            await flushPromises();
            expect(peer.showAudioStream).toHaveBeenCalledTimes(1);

            asMock(avatar.calcDistance).mockReturnValue(
                desktopAudioCutOffDistance - 5
            );
            jest.advanceTimersByTime(1000);
            await flushPromises();
            expect(peer.showAudioStream).toHaveBeenCalledTimes(2);

            asMock(avatar.calcDistance).mockReturnValue(
                desktopAudioCutOffDistance + 5
            );
            jest.advanceTimersByTime(1000);
            await flushPromises();
            expect(peer.stopShowingAudioStream).toHaveBeenCalledTimes(1);
        });

        test("set my local avatar correctly", () => {
            expect(virtualWorld.setType).toHaveBeenCalledWith("tv");
        });
    });

    describe("given peer is TV", () => {
        beforeEach(async () => {
            const room = new RoomController(local, remoteRoom, virtualWorld);
            await room.join();

            await flushPromises();

            await peer.onConfig.emit({
                ...myConfig,
                type: "tv",
            });
        });

        test("shows it on a huge TV!", () => {
            expect(avatar.setType).toHaveBeenCalledWith("tv");
        });
    });
});
