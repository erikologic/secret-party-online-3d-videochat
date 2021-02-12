import swarm from "./webrtc-swarm";
import signalhub from "signalhub";

export class Network {
    constructor() {
        this.connect = this.connect.bind(this);
        this.onPeerConnect = undefined;
        this.onPeerDisconnect = undefined;
    }
    
    connect() {
        console.log("loading hub: ",process.env.HUB_URL);
        const hub = signalhub('lets-party', [process.env.HUB_URL]);
        console.log(hub);
        const turnServer = process.env.TURN_IP;
        const sw = swarm(hub,
            {
                config: {
                    iceServers: [
                        {urls: 'stun:stun.l.google.com:19302'},
                        { urls: `stun:${turnServer}:3478` },
                        { urls: `turn:${turnServer}:3478`, username: "username1", credential: "password1" },
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
