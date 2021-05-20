import { Listener, MyEventEmitter } from "../shared/myEventEmitter";

export interface Local {
    showLocalVideo: () => void;
    getLocalStream: () => Promise<MyStream>;
}

export interface Peer {
    onStream: MyEventEmitter<MyStream>;
    onDisconnect: MyEventEmitter<void>;
    id: string;
    onPositionUpdate: MyEventEmitter<MyPosition>;
}

export interface RemoteRoom {
    broadcastLocalPosition: Listener<MyPosition>;
    getPeers: () => Promise<Peer[]>;
    sendLocalStream: (localStream: MyStream) => Promise<void>;
    join: () => Promise<void>;
    onNewPeer: MyEventEmitter<Peer>;
}

export interface Avatar {
    remove: Listener<void>;
    moveTo: Listener<MyPosition>;
    showVideo: Listener<MyStream>;
    showAudio: Listener<MyStream>;
}

export interface VirtualWorld {
    onPositionUpdate: MyEventEmitter<MyPosition>;
    createAvatar: (peerId: string) => Avatar;
    start: () => Promise<void>;
}

export type MyStream = {
    stream: MediaStream;
};

export interface MyPosition {
    absoluteRotation: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    globalPosition: {
        x: number;
        y: number;
        z: number;
    };
}
