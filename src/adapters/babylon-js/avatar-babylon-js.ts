import { Avatar, MyPosition, MyStream, PeerType } from "../../domain/types";
import { Listener } from "../../shared/my-event-emitter";
import {
    Axis,
    Color3,
    Material,
    Mesh,
    MeshBuilder,
    PBRMaterial,
    Quaternion,
    Scene,
    Sound,
    StandardMaterial,
    Tools,
    Vector3,
    VideoTexture,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";

const VIDEO_RATIO = 4 / 3;
const VIDEO_HEIGHT = 0.9;
const VIDEO_DIMENSIONS = {
    height: VIDEO_HEIGHT,
    width: VIDEO_RATIO * VIDEO_HEIGHT,
    depth: 0.05,
    sideOrientation: Mesh.FRONTSIDE,
};

export class AvatarBabylonJs implements Avatar {
    private videoPanel: Mesh | undefined;
    private readonly mesh: Mesh;
    private text: TextBlock | undefined;

    constructor(private id: string, private scene: Scene) {
        this.mesh = this.createAvatarMesh(scene);
    }

    setName(name: string): void {
        const plane = Mesh.CreatePlane("namePlane", 2, this.scene);
        plane.parent = this.mesh;
        plane.position.x = 0;
        plane.position.y = -0.4;
        plane.position.z = 0.06;
        plane.rotation.y = Math.PI;
        const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

        const text = new TextBlock("name", name);
        text.width = "450px";
        text.height = "550px";
        text.color = "white";
        text.fontSize = "80px";
        text.resizeToFit = true;
        advancedTexture.addControl(text);
        this.text = text;
    }

    setColor(color: string): void {
        (this.mesh.material as PBRMaterial).albedoColor =
            Color3.FromHexString(color);
    }

    calcAngle = () => {
        const camera = this.scene.cameras[0];
        const v0 = camera.getDirection(Axis.Z);
        v0.y = 0; //horizontal components only
        v0.normalize();

        //direction from camera to cube
        const v1 = this.mesh.position.subtract(camera.position);
        v1.y = 0; //horizontal components only]
        v1.normalize();

        let angle = Math.acos(Vector3.Dot(v0, v1));

        //find whether rotation is clockwise or anti-clockwise
        const direction = Vector3.Cross(v0, v1).y;
        if (direction < 0) {
            angle *= -1;
        }
        return Tools.ToDegrees(angle);
    };

    calcDistance = () =>
        Vector3.Distance(this.scene.cameras[0].position, this.mesh.position);

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
        console.log(`STREAM ${stream.id} --> showVideo`);
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
        this.videoPanel = videoPanel;
    }

    setType(type: PeerType): void {
        if (type === "tv") {
            console.log("setting to TV");
            const scaling = 10;
            this.mesh.scaling.x = scaling * 1.333;
            this.mesh.scaling.y = scaling;

            // This is so bad...
            // So I had to delay the sending of a stream because of the signaling protocol
            // But sometimes the code can reach here before there is a stream available
            // And will fail silently
            // TODO this has to be managed via messaging properly
            setTimeout(() => {
                this.videoPanel!.material!.backFaceCulling = false;
                this.videoPanel!.rotation.y = Math.PI;
                this.text!.fontSize = "40px";
            }, 2500);
        }
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

    private getMaterial(scene: Scene): Material {
        // TODO remove the usage of PBRMaterial everywhere to improve performance...?
        const mat = new PBRMaterial(`VideoBoxMaterial_${this.id}`, scene);
        mat.albedoColor = new Color3(0, 0, 0);
        mat.metallic = 0.01;
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
