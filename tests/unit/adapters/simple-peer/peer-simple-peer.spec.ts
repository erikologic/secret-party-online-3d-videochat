import SimplePeer from "simple-peer";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wrtc from "wrtc";
import { PeerSimplePeer } from "../../../../src/adapters/simple-peer/peer-simple-peer";
import { MyPosition, MyStream } from "../../../../src/domain/types";
import { getStream } from "./create-media-stream";

const getSimplePeers = (): Promise<
    [SimplePeer.Instance, SimplePeer.Instance]
> =>
    new Promise<[SimplePeer.Instance, SimplePeer.Instance]>((resolve) => {
        const peer1 = new SimplePeer({ initiator: true, wrtc });
        const peer2 = new SimplePeer({ wrtc });

        peer1.on("signal", (data) => {
            peer2.signal(data);
        });

        peer2.on("signal", (data) => {
            peer1.signal(data);
        });

        peer2.on("connect", () => {
            resolve([peer1, peer2]);
        });
    });

const asyncTimeout = (millis: number) =>
    new Promise<void>((resolve) => {
        setTimeout(() => resolve(), millis);
    });

describe("connecting 2 peers via PeerSimplePeer", () => {
    let peer1: SimplePeer.Instance, peer2: SimplePeer.Instance;
    let myPeer1: PeerSimplePeer, myPeer2: PeerSimplePeer;

    beforeEach(async () => {
        [peer1, peer2] = await getSimplePeers();

        myPeer1 = new PeerSimplePeer(peer1, "peer1");
        myPeer2 = new PeerSimplePeer(peer2, "peer2");
    });

    afterEach(() => {
        peer1.destroy();
        peer2.destroy();
    });

    test("can disconnect", async () => {
        const mock = jest.fn();
        myPeer1.onDisconnect.subscribe(mock);

        peer2.destroy();
        await asyncTimeout(300);
        expect(mock).toBeCalled();
    });

    test("can send position", async () => {
        const position: MyPosition = {
            absoluteRotation: { w: 0, x: 0, y: 0, z: 0 },
            globalPosition: { x: 0, y: 0, z: 0 },
        };

        const mock = jest.fn();
        myPeer1.onPositionUpdate.subscribe(mock);

        await myPeer2.sendLocalPosition(position);

        await asyncTimeout(2_000);
        expect(mock.mock.calls[0][0]).toEqual(position);
    });

    describe("for streams", () => {
        let stopStream: () => void, myStream: MyStream, mock: jest.Mock;

        beforeEach(async () => {
            const mediaStreamHandles = getStream();
            stopStream = mediaStreamHandles.stopStream;

            myStream = {
                stream: mediaStreamHandles.stream,
            };

            mock = jest.fn();
            myPeer1.onStream.subscribe(mock);
            await myPeer2.sendLocalStream(myStream);
        });

        afterEach(() => {
            stopStream();
        });

        test.skip("does not send the stream if not commanded to", async () => {
            // TODO this works in the browser _shrug_
            await asyncTimeout(2_000);
            expect(mock.mock.calls[0][0].stream.getVideoTracks()).toHaveLength(
                1
            );
            expect(
                mock.mock.calls[0][0].stream.getVideoTracks()[0].enabled
            ).toBeFalsy();
        });

        test("send the stream", async () => {
            await myPeer2.showStream();

            await asyncTimeout(2_000);
            expect(mock.mock.calls[0][0].stream).toEqual(myStream.stream);
            expect(mock.mock.calls[0][0].stream.getVideoTracks()).toHaveLength(
                1
            );
            expect(
                mock.mock.calls[0][0].stream.getVideoTracks()[0].enabled
            ).toBeTruthy();
        });

        test.skip("stop sending the stream when commanded to", async () => {
            // TODO this works in the browser _shrug_
            await myPeer2.showStream();

            await asyncTimeout(500);
            await myPeer2.stopShowingStream();

            await asyncTimeout(2_000);
            expect(
                mock.mock.calls[0][0].stream.getVideoTracks()[0].enabled
            ).toBeFalsy();
        });
    });
});
