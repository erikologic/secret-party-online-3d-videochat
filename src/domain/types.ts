import { Listener, MyEventEmitter } from "../shared/myEventEmitter";

export interface Local {
    showLocalWebcamVideo: () => void;
    getLocalWebcamVideo: () => Promise<LocalVideo>;
    getLocalWebcamAudio: () => Promise<LocalAudio>;
    getLocalConfiguration: () => LocalConfiguration;
}

export interface Peer {
    onDisconnect: MyEventEmitter<void>;
    getAudio: () => Promise<RemoteAudio>;
    getVideo: () => Promise<RemoteVideo>;
    id: string;
    onPositionUpdate: MyEventEmitter<PeerPosition>;
    getConfiguration: () => Promise<PeerConfiguration>;
}

export interface RemoteRoom {
    broadcastLocalPosition: Listener<LocalPosition>;
    setLocalConfiguration: (configuration: LocalConfiguration) => Promise<void>;
    getPeers: () => Promise<Peer[]>;
    sendLocalAudio: (localAudio: LocalAudio) => Promise<void>;
    sendLocalVideo: (localVideo: LocalVideo) => Promise<void>;
    join: () => Promise<void>;
    onNewPeer: MyEventEmitter<Peer>;
}

export interface Avatar {
    remove: Listener<void>;
    setConfiguration: (configuration: PeerConfiguration) => void;
    moveTo: Listener<PeerPosition>;
    showVideo: (remoteVideo: RemoteVideo) => void;
    showAudio: (remoteAudio: RemoteAudio) => void;
}

export interface VirtualWorld {
    onPositionUpdate: MyEventEmitter<PeerPosition>;
    createAvatar: () => Avatar;
    start: () => Promise<void>;
}

export type LocalAudio = {};
export type LocalVideo = {};
export type RemoteAudio = {};
export type RemoteVideo = {};
export type PeerPosition = {};
export type LocalPosition = {};

export interface LocalConfiguration {
    name: string;
}

export interface PeerConfiguration {
    name: string;
}
