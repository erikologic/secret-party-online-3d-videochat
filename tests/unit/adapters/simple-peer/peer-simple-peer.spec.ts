import SimplePeer from "simple-peer";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import wrtc from "wrtc";
import { PeerSimplePeer } from "../../../../src/adapters/simple-peer/peer-simple-peer";
import { MyPosition, MyStream, PeerConfig } from "../../../../src/domain/types";

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

    test("can send configuration", async () => {
        const config: PeerConfig = {
            color: "33ff55",
            name: "l0rdP3eer",
            type: "peer",
        };

        const mock = jest.fn();
        myPeer1.onConfig.subscribe(mock);

        await myPeer2.sendConfig(config);

        await asyncTimeout(2_000);
        expect(mock).toHaveBeenCalled();
        expect(mock.mock.calls[0][0]).toEqual(config);
    });
});
