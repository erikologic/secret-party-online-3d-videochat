import { Avatar, MyPosition, PeerType, VirtualWorld } from "../../domain/types";
import { MyEventEmitter } from "../../shared/my-event-emitter";
import { Camera, Engine, FreeCamera, Scene, Vector3 } from "@babylonjs/core";
import { createScene } from "./scene";
import { AvatarBabylonJs } from "./avatar-babylon-js";

export class VirtualWorldBabylonJs implements VirtualWorld {
    private scene: Scene | undefined;
    private camera: Camera | undefined;

    createAvatar(peerId: string): Avatar {
        if (!this.scene) throw new Error("scene not defined yet");
        return new AvatarBabylonJs(peerId, this.scene);
    }

    onPositionUpdate = new MyEventEmitter<MyPosition>();

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
        this.camera = this.scene.cameras[0];
        this.setOnPositionUpdate(this.camera);

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
        camera.onViewMatrixChangedObservable.add((camera) => {
            delta += camera.getScene().getEngine().getDeltaTime();
            const { globalPosition, absoluteRotation } = camera;

            if (delta > millisFor30Fps) {
                delta = 0;

                this.onPositionUpdate.emit({
                    globalPosition,
                    absoluteRotation,
                });
            }
        });

        setInterval(() => {
            const { globalPosition, absoluteRotation } = camera;
            this.onPositionUpdate.emit({ globalPosition, absoluteRotation });
        }, 1000);
    }

    setType(type: PeerType): void {
        if (type === "tv") {
            const camera = this.camera! as FreeCamera;
            camera.ellipsoid.y = 1;
            camera.position.x = -37.26;
            camera.position.y = 10.538;
            camera.position.z = -3.645;
            camera.rotation.x = 0.216043561320024;
            camera.rotation.y = 1.5917210241062403;
        }
    }
}
