import { Listener, MyEventEmitter } from "../shared/myEventEmitter";

export interface Local {
    showLocalWebcamVideo: () => void;
    getLocalWebcamVideo: () => Promise<LocalVideo>;
    getLocalWebcamAudio: () => Promise<LocalAudio>;
    // getLocalConfiguration: () => LocalConfiguration;
}

export interface Peer {
    onDisconnect: MyEventEmitter<void>;
    getAudio: () => Promise<RemoteAudio>;
    getVideo: () => Promise<RemoteVideo>;
    id: string;
    onPositionUpdate: MyEventEmitter<PeerPosition>;
}

export interface RemoteRoom {
    broadcastLocalPosition: Listener<LocalPosition>;
    getPeers: () => Promise<Peer[]>;
    sendLocalAudio: (localAudio: LocalAudio) => Promise<void>;
    sendLocalVideo: (localVideo: LocalVideo) => Promise<void>;
    join: () => Promise<void>;
    onNewPeer: MyEventEmitter<Peer>;
}

export interface Avatar {
    remove: Listener<void>;
    moveTo: Listener<PeerPosition>;
    showVideo: (remoteVideo: RemoteVideo) => void;
    showAudio: (remoteAudio: RemoteAudio) => void;
}

export interface VirtualWorld {
    onPositionUpdate: MyEventEmitter<LocalPosition>;
    createAvatar: (peerId: string) => Avatar;
    start: () => Promise<void>;
}

export type LocalAudio = {};
export type LocalVideo = {};
export interface RemoteAudio {
    stream: MediaStream;
}
export type RemoteVideo = {
    stream: MediaStream;
};

export interface PeerPosition {
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

export interface LocalPosition {
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
