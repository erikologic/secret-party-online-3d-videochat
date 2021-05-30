import { Listener, MyEventEmitter } from "../shared/my-event-emitter";

export interface Local {
    init: () => void;
    showLocalVideo: () => void;
    getLocalStream: () => Promise<MyStream>;
    getDesktopStream: () => Promise<MyStream>;
    getConfig: () => PeerConfig;
}

export interface Peer {
    sendConfig: (config: PeerConfig) => Promise<void>;
    onConfig: MyEventEmitter<PeerConfig>;
    showAudioStream: () => Promise<void>;
    stopShowingAudioStream: () => Promise<void>;
    onStream: MyEventEmitter<MyStream>;
    onDisconnect: MyEventEmitter<void>;
    id: string;
    onPositionUpdate: MyEventEmitter<MyPosition>;
    showVideoStream: () => Promise<void>;
    stopShowingVideoStream: () => Promise<void>;
}

export interface RemoteRoom {
    broadcastLocalPosition: Listener<MyPosition>;
    getPeers: () => Promise<Peer[]>;
    sendLocalStream: (localStream: MyStream) => Promise<void>;
    join: () => Promise<void>;
    onNewPeer: MyEventEmitter<Peer>;
}

export interface Avatar {
    setType: (type: PeerType) => void;
    setName: (name: string) => void;
    setColor: (color: string) => void;
    calcAngle: () => number;
    calcDistance: () => number;
    remove: Listener<void>;
    moveTo: Listener<MyPosition>;
    showVideo: Listener<MyStream>;
    showAudio: Listener<MyStream>;
}

export interface VirtualWorld {
    setType: (type: PeerType) => void;
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

type PeerType = "peer" | "tv";

export interface PeerConfig {
    type: PeerType;
    color: string;
    name: string;
}
