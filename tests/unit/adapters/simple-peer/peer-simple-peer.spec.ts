import SimplePeer from "simple-peer";
// @ts-ignore
import wrtc from "wrtc";
import { PeerSimplePeer } from "../../../../src/adapters/simple-peer/peer-simple-peer";
import { MyPosition, MyStream } from "../../../../src/domain/types";
import DoneCallback = jest.DoneCallback;
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

    test("can send position", async (done) => {
        const position: MyPosition = {
            absoluteRotation: { w: 0, x: 0, y: 0, z: 0 },
            globalPosition: { x: 0, y: 0, z: 0 },
        };

        myPeer1.onPositionUpdate.subscribe(async (receivedPosition) => {
            try {
                expect(receivedPosition).toEqual(position);
                done();
            } catch (e) {
                done(e);
            }
        });

        await myPeer2.sendLocalPosition(position);
    });

    test("can send stream", async (done) => {
        const { stream, stopStream } = getStream();

        const myStream: MyStream = {
            stream,
        };

        myPeer1.onStream.subscribe(async (receivedStream) => {
            try {
                expect(receivedStream).toEqual(myStream);
                stopStream();
                done();
            } catch (e) {
                done(e);
            }
        });

        await myPeer2.sendLocalStream(myStream);
    });
});
