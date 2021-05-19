import { Avatar, LocalPosition, VirtualWorld } from "../domain/types";
import { MyEventEmitter } from "../shared/myEventEmitter";
import { Camera, Engine, Scene } from "@babylonjs/core";
import { createScene } from "./scene";
import { AvatarBabylonJs } from "./avatar-babylon-js";

export class VirtualWorldBabylonJs implements VirtualWorld {
    private scene: Scene | undefined;

    createAvatar(peerId: string): Avatar {
        if (!this.scene) throw new Error("scene not defined yet");
        return new AvatarBabylonJs(peerId, this.scene);
    }

    onPositionUpdate = new MyEventEmitter<LocalPosition>();

    start = async (): Promise<void> => {
        const canvas = document.getElementById(
            "renderCanvas"
        ) as HTMLCanvasElement;
        const engine = new Engine(canvas, true, {
            preserveDrawingBuffer: true,
            stencil: true,
        });
        if (!engine) throw "engine should not be null.";
        this.scene = createScene(engine, canvas);

        // @ts-ignore
        window.scene = this.scene; // TODO remove me
        const camera = this.scene.cameras[0];
        this.setOnPositionUpdate(camera);

        // Resize
        window.addEventListener("resize", () => {
            engine.resize();
        });

        engine.runRenderLoop(() => {
            if (this.scene) {
                this.scene.render();
            }
        });
    };

    private setOnPositionUpdate(camera: Camera): void {
        const millisFor30Fps = 1000 / 30;
        let delta = 0;
        const { globalPosition, absoluteRotation } = camera;
        camera.onViewMatrixChangedObservable.add((camera) => {
            delta += camera.getScene().getEngine().getDeltaTime();

            if (delta > millisFor30Fps) {
                delta = 0;
                this.onPositionUpdate.emit({
                    globalPosition,
                    absoluteRotation,
                });
            }
        });

        setInterval(() => {
            this.onPositionUpdate.emit({ globalPosition, absoluteRotation });
        }, 1000);
    }
}
