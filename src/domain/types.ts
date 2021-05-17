import { MyEventEmitter } from "../shared/myEventEmitter";

export interface Local {
    showLocalWebcamVideo: () => void;
    getLocalWebcamVideo: () => Promise<LocalVideo>;
    getLocalWebcamAudio: () => Promise<LocalAudio>;
    getLocalConfiguration: () => LocalConfiguration;
}

export interface Peer {
    getAudio: () => Promise<RemoteAudio>;
    getVideo: () => Promise<RemoteVideo>;
    id: string;
    onPositionUpdate: (position: PeerPosition) => void;
    getConfiguration: () => Promise<PeerConfiguration>;
}

export interface RemoteRoom {
    broadcastLocalPosition: (localPosition: LocalPosition) => Promise<void>;
    setLocalConfiguration: (configuration: LocalConfiguration) => Promise<void>;
    getPeers: () => Promise<Peer[]>;
    sendLocalAudio: (localAudio: LocalAudio) => Promise<void>;
    sendLocalVideo: (localVideo: LocalVideo) => Promise<void>;
    join: () => Promise<void>;
    onNewPeer: MyEventEmitter<Peer>;
}

export interface Avatar {
    setConfiguration: (configuration: PeerConfiguration) => void;
    moveTo: (position: PeerPosition) => void;
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
