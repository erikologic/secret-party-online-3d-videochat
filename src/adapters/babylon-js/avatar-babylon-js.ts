import { Avatar, MyPosition, MyStream } from "../../domain/types";
import { Listener } from "../../shared/my-event-emitter";
import {
    Color3,
    Mesh,
    MeshBuilder,
    Quaternion,
    Scene,
    Sound,
    StandardMaterial,
    Vector3,
    VideoTexture,
} from "@babylonjs/core";

const VIDEO_RATIO = 4 / 3;
const VIDEO_HEIGHT = 0.9;
const VIDEO_DIMENSIONS = {
    height: VIDEO_HEIGHT,
    width: VIDEO_RATIO * VIDEO_HEIGHT,
    depth: 0.05,
    sideOrientation: Mesh.FRONTSIDE,
};

export class AvatarBabylonJs implements Avatar {
    private readonly mesh: Mesh;

    constructor(private id: string, private scene: Scene) {
        this.mesh = this.createAvatarMesh(scene);
    }

    moveTo: Listener<MyPosition> = async ({
        absoluteRotation,
        globalPosition,
    }) => {
        this.mesh.rotationQuaternion = new Quaternion(
            absoluteRotation.x,
            absoluteRotation.y,
            absoluteRotation.z,
            absoluteRotation.w
        );
        this.mesh.setAbsolutePosition(
            new Vector3(globalPosition.x, globalPosition.y, globalPosition.z)
        );
    };

    remove: Listener<void> = async () => {
        this.mesh.dispose();
    };

    async showAudio({ stream }: MyStream): Promise<void> {
        const audio = new Audio();
        audio.muted = true;
        audio.srcObject = stream;
        const remoteSound = new Sound(
            `RemoteSound_${this.id}`,
            stream,
            this.scene,
            null,
            {
                streaming: true,
                autoplay: true,
                spatialSound: true,
                loop: true,
                distanceModel: "exponential",
                maxDistance: 100,
                rolloffFactor: 1.3,
            }
        );
        remoteSound.attachToMesh(this.mesh);
        remoteSound.setDirectionalCone(90, 180, 0.3);
        remoteSound.setLocalDirectionToMesh(new Vector3(0, 0, 1));
    }

    async showVideo({ stream }: MyStream): Promise<void> {
        const videoPanel = AvatarBabylonJs.getVideoPanel();
        const videoTexture = await this.createTextureFromStreamAsync(
            stream,
            this.scene
        );
        videoPanel.material = this.getVideoPanelMaterial(
            videoTexture,
            this.scene
        );
        videoPanel.parent = this.mesh;
        videoPanel.receiveShadows = true;
    }

    //  -------------------- PRIVATE --------------------
    private createAvatarMesh(scene: Scene): Mesh {
        const mesh = this.getBox();
        mesh.material = this.getMaterial(scene);
        mesh.receiveShadows = true;
        mesh.position.y = 1.6;
        return mesh;
    }

    private getBox(): Mesh {
        const box = MeshBuilder.CreateBox(`VideoBox_${this.id}`, {
            sideOrientation: VIDEO_DIMENSIONS.sideOrientation,
            width: VIDEO_DIMENSIONS.width + 0.1,
            height: VIDEO_DIMENSIONS.height + 0.1,
            depth: VIDEO_DIMENSIONS.depth,
        });
        box.position = new Vector3(0, 0, 0);
        box.checkCollisions = true;
        return box;
    }

    private getMaterial(scene: Scene): StandardMaterial {
        const mat = new StandardMaterial(`VideoBoxMaterial_${this.id}`, scene);
        mat.diffuseColor = new Color3(0, 0, 0);
        mat.specularPower = Number.MAX_VALUE;
        return mat;
    }

    private static getVideoPanel(): Mesh {
        const videoPanel = MeshBuilder.CreatePlane(
            "VideoPanel",
            VIDEO_DIMENSIONS
        );
        videoPanel.position = new Vector3(
            0,
            0,
            VIDEO_DIMENSIONS.depth / 2 + 0.001
        );
        videoPanel.toLeftHanded();
        return videoPanel;
    }

    private createTextureFromStreamAsync(
        stream: MediaStream,
        scene: Scene
    ): Promise<VideoTexture> {
        console.log(stream);
        const video: HTMLVideoElement = document.createElement("video");
        video.setAttribute("autoplay", "");
        video.setAttribute("muted", "true");
        video.setAttribute("playsinline", "");
        video.id = `remote-video-${this.id}`;
        video.muted = true;

        if (video.mozSrcObject !== undefined) {
            // hack for Firefox < 19
            video.mozSrcObject = stream;
        } else {
            if (typeof video.srcObject == "object") {
                video.srcObject = stream;
            } else {
                window.URL =
                    window.URL ||
                    window.webkitURL ||
                    window.mozURL ||
                    window.msURL;
                video.src = window.URL && window.URL.createObjectURL(stream);
            }
        }

        return new Promise((resolve) => {
            const onPlaying = (): void => {
                resolve(
                    new VideoTexture(
                        `VideoTextureStream_${this.id}`,
                        video,
                        scene,
                        true,
                        false
                    )
                );
                video.removeEventListener("playing", onPlaying);
            };

            video.addEventListener("playing", onPlaying);
            video.play();
        });
    }

    private getVideoPanelMaterial(
        videoTexture: VideoTexture,
        scene: Scene
    ): StandardMaterial {
        const videoPanelMaterial = new StandardMaterial(
            `VideoPanelMaterial_${this.id}`,
            scene
        );
        videoPanelMaterial.roughness = 1;
        videoPanelMaterial.emissiveColor = Color3.White();
        videoPanelMaterial.diffuseTexture = videoTexture;
        videoPanelMaterial.specularPower = Number.MAX_VALUE;
        return videoPanelMaterial;
    }
}
