import {Camera, Engine} from "@babylonjs/core";
import {Peer3d} from "./peer-3d";

const millisFor30Fps = 1000 / 30;

export function sendCameraPositionFactory(camera: Camera, peers: { [id: string]: Peer3d }): (engine: Engine) => void {
    let delta = 0;

    return (engine: Engine): void => {
        delta += engine.getDeltaTime();

        if (delta > millisFor30Fps) {
            delta = 0;
            for (const peer in peers) {
                peers[peer].send(camera);
            }
        }
    };
}