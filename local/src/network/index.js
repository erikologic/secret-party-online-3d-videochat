import swarm from "./webrtc-swarm";
import signalhub from "signalhub";

export class Network {
    constructor({onPeerConnect, onPeerDisconnect}) {
        this.connect = this.connect.bind(this);
        this.onPeerConnect = onPeerConnect;
        this.onPeerDisconnect = onPeerDisconnect;
    }

    connect() {
        console.log("loading hub");
        const hub = signalhub('lets-party', ['https://lets-party-videochat.herokuapp.com/']);
        console.log(hub);
        const turnServerIp = "35.236.234.201";
        const sw = swarm(hub,
            {
                config: {
                    iceServers: [
                        {urls: 'stun:stun.l.google.com:19302'},
                        // { urls: `stun:${turnServerIp}:3478` },
                        // { urls: `turn:${turnServerIp}:3478`, username: "username1", credential: "password1" },
                    ],
                },
            });

        sw.on('connect', (peer, id) => {
            console.log('connected to a new peer:', peer, id);
            console.log('total peers:', sw.peers.length);
            this.onPeerConnect && this.onPeerConnect(peer, id);
        });

        sw.on('disconnect', (peer, id) => {
            console.log('disconnected from a peer:', id);
            console.log('total peers:', sw.peers.length);
            this.onPeerDisconnect && this.onPeerDisconnect(peer, id);
        });

        window.sw = sw; // TODO remove me!
    }
}