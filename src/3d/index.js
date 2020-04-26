import {Engine} from "@babylonjs/core";
import {createScene} from './scene';
import { Peer3d } from "./peer-3d";

function marshalCameraPosition(camera) {
    return JSON.stringify({
        absoluteRotation: {
            ...camera.absoluteRotation
        },
        globalPosition: {
            ...camera.globalPosition
        }
    });
}

export class ThreeD {
    constructor() {
        this.startEngine = this.startEngine.bind(this);
        this.addPeer = this.addPeer.bind(this);
        this.removePeer = this.removePeer.bind(this);
        this.peers = {};

        this.canvas = document.getElementById("renderCanvas");
        this.engine = new Engine(
            this.canvas,
            true, {
                preserveDrawingBuffer: true,
                stencil: true
            });
        if (!this.engine) throw 'engine should not be null.';
        this.scene = createScene(this.engine, this.canvas);

        window.scene = this.scene; // TODO remove me
        this.camera = this.scene.cameras[0];

        // Resize
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    startEngine() {
        let lastCameraPos = null;
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                const newCameraPos = marshalCameraPosition(this.camera);
                if (lastCameraPos !== newCameraPos) {
                    lastCameraPos = newCameraPos;
                    Object.values(this.peers).forEach(peer => peer.send(newCameraPos));
                }
                this.scene.render();
            }
        });
    }

    addPeer(peer, id) {
        this.peers[id] = new Peer3d(peer, id, this.scene);
    }

    removePeer(id) {
        this.peers[id].destroy();
        delete this.peers[id];
        console.log(this.peers);
    }
}
