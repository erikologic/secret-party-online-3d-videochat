import {Camera, Engine, Scene} from "@babylonjs/core";
import {createScene} from './scene';
import { Peer3d } from "./peer-3d";

function marshalCameraPosition(camera: Camera): string {
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
    private peers: any;
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;
    private camera: Camera;
    
    constructor() {
        this.peers = {};

        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.engine = new Engine(
            this.canvas,
            true, {
                preserveDrawingBuffer: true,
                stencil: true
            });
        if (!this.engine) throw 'engine should not be null.';
        this.scene = createScene(this.engine, this.canvas);

        // @ts-ignore
        window.scene = this.scene; // TODO remove me
        this.camera = this.scene.cameras[0];

        // Resize
        window.addEventListener("resize", () => {
            this.engine.resize();
        });
    }

    startEngine(): void {
        let lastCameraPos = "";
        this.engine.runRenderLoop(() => {
            if (this.scene) {
                const newCameraPos = marshalCameraPosition(this.camera);
                if (lastCameraPos !== newCameraPos) {
                    lastCameraPos = newCameraPos;
                    Object.values(this.peers).forEach((peer: any) => peer.send(newCameraPos));
                }
                this.scene.render();
            }
        });
    }

    addPeer(peer: any, id: string): void {
        this.peers[id] = new Peer3d(peer, id, this.scene);
    }

    removePeer(id: string): void {
        this.peers[id].destroy();
        delete this.peers[id];
        console.log(this.peers);
    }
}
