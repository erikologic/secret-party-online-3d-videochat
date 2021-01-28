import swarm from "./webrtc-swarm";
import signalhub from "signalhub";

const hubUrl = process.env.ENV === 'dev' ? 'http://localhost:8080' : 'https://secret-party.duckdns.org/';

export class Network {
    constructor() {
        this.connect = this.connect.bind(this);
        this.onPeerConnect = undefined;
        this.onPeerDisconnect = undefined;
    }
    
    connect() {
        console.log("loading hub");
        const hub = signalhub('lets-party', [hubUrl]);
        console.log(hub);
        const turnServer = "secret-party.duckdns.org";
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
