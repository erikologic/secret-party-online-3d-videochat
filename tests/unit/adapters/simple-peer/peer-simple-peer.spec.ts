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

    test("can disconnect", (done) => {
        myPeer1.onDisconnect.subscribe(async () => {
            try {
                done();
            } catch (e) {
                done(e);
            }
        });

        peer2.destroy();
    });

    test("can send position", async () => {
        const position: MyPosition = {
            absoluteRotation: { w: 0, x: 0, y: 0, z: 0 },
            globalPosition: { x: 0, y: 0, z: 0 },
        };

        const mock = jest.fn();
        myPeer1.onPositionUpdate.subscribe(mock);

        await myPeer2.sendLocalPosition(position);

        await asyncTimeout(2000);
        expect(mock.mock.calls[0][0]).toEqual(position);
    });

    test("does not send the stream if not commanded to", async () => {
        const { stream, stopStream } = getStream();

        const myStream: MyStream = {
            stream,
        };

        const mock = jest.fn();
        await myPeer2.sendLocalStream(myStream);

        await asyncTimeout(2000);
        expect(mock).not.toBeCalled();
        stopStream();
    });

    test("send the stream", async () => {
        const { stream, stopStream } = getStream();

        const myStream: MyStream = {
            stream,
        };

        const mock = jest.fn();
        myPeer1.onStream.subscribe(mock);

        await myPeer2.sendLocalStream(myStream);
        await myPeer2.showStream();

        await asyncTimeout(2000);
        expect(mock.mock.calls[0][0].stream).toEqual(myStream.stream);
        expect(mock.mock.calls[0][0].stream.getTracks()).toHaveLength(1);
        stopStream();
    });

    test("stop sending the stream when commanded to", async () => {
        const { stream, stopStream } = getStream();

        const myStream: MyStream = {
            stream,
        };

        const mock = jest.fn();
        myPeer1.onStream.subscribe(mock);
        await myPeer2.sendLocalStream(myStream);
        await myPeer2.showStream();

        await asyncTimeout(1000);
        await myPeer2.stopShowingStream();

        await asyncTimeout(2000);
        expect(mock.mock.calls[0][0].stream.getTracks()).toHaveLength(0);
        stopStream();
    });
});
