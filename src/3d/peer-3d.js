import {
    Color3,
    Color4,
    Mesh,
    MeshBuilder,
    Quaternion,
    Sound,
    StandardMaterial,
    Vector3,
    VideoTexture
} from "@babylonjs/core";


const VIDEO_DIMENSIONS = {
    height: 2,
    width: 1.5,
    sideOrientation: Mesh.FRONTSIDE
};

export class Peer3d {
    constructor(peer, id, scene) {
        this.movePeer = this.movePeer.bind(this);
        this.send = this.send.bind(this);
        this.destroy = this.destroy.bind(this);
        this._addSpatialAudio = this._addSpatialAudio.bind(this);
        this._getMaterial = this._getMaterial.bind(this);
        this._getVideoPanelMaterial = this._getVideoPanelMaterial.bind(this);
        this._getVideoPanel = this._getVideoPanel.bind(this);
        this._getBox = this._getBox.bind(this);
        this._CreateFromStreamAsync = this._CreateFromStreamAsync.bind(this);
        this._addTo = this._addTo.bind(this);

        this.peer = peer;
        this.scene = scene;
        this.id = id;

        if (peer._remoteStreams[0]) {
            this._addTo(this.scene, peer._remoteStreams[0]);
        } else {
            peer.on('stream', stream => this._addTo(this.scene, stream));
        }

        peer.on('data', data => this.movePeer(data));
    }

    send(cameraPos) {
        try {
            this.peer.send(cameraPos);
        } catch (e) {
            console.log(e);
        }
    }

    destroy() {
        this.mesh && this.mesh.dispose();
    }

    movePeer(buffer) {
        const {absoluteRotation, globalPosition} = JSON.parse(buffer.toString());
        console.log({absoluteRotation, globalPosition});
        this.mesh && (this.mesh.rotationQuaternion = new Quaternion(absoluteRotation.x, absoluteRotation.y, absoluteRotation.z, absoluteRotation.w));
        this.mesh && this.mesh.setAbsolutePosition(new Vector3(globalPosition.x, globalPosition.y, globalPosition.z));
    }

    _addSpatialAudio(stream, scene, box) {
        var audio = new Audio();
        audio.muted = true;
        audio.srcObject = stream;
        var remoteSound = new Sound(`RemoteSound_${this.id}`, stream, scene, null, {
            streaming: true,
            autoplay: true,
            spatialSound: true,
            loop: true
        });
        remoteSound.attachToMesh(box);
        remoteSound.setDirectionalCone(90, 180, 0.3);
        remoteSound.setLocalDirectionToMesh(new Vector3(0, 0, 1));
    }

    _getMaterial() {
        var mat = new StandardMaterial(`VideoBoxMaterial_${this.id}`);
        mat.diffuseColor = new Color4(0, 0, 0, 1);
        return mat;
    }

    _getVideoPanelMaterial(videoTexture) {
        var videoPanelMaterial = new StandardMaterial(`VideoPanelMaterial_${this.id}`);
        videoPanelMaterial.roughness = 1;
        videoPanelMaterial.emissiveColor = new Color3.White();
        videoPanelMaterial.diffuseTexture = videoTexture;
        return videoPanelMaterial;
    }

    _getVideoPanel() {
        var videoPanel = MeshBuilder.CreatePlane("VideoPanel", VIDEO_DIMENSIONS);
        videoPanel.position = (new Vector3(0, 0, 0.1)).addInPlace(this.mesh.position);
        videoPanel.toLeftHanded();
        return videoPanel;
    }

    _getBox() {
        var box = MeshBuilder.CreateBox(`VideoBox_${this.id}`, {
            sideOrientation: VIDEO_DIMENSIONS.sideOrientation,
            width: VIDEO_DIMENSIONS.width + 0.1,
            height: VIDEO_DIMENSIONS.height + 0.1,
            depth: 0.100000
        });
        box.position = new Vector3(Math.random() * 100, Math.random() * 100, Math.random() * 100);
        box.checkCollisions = true;
        return box;
    }

    _CreateFromStreamAsync(scene, stream) {
        console.log(stream);
        var video = document.createElement("video");
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', 'true');
        video.setAttribute('playsinline', '');
        video.id = `remote-video-${this.id}`;
        video.muted = true;

        if (video.mozSrcObject !== undefined) {
            // hack for Firefox < 19
            video.mozSrcObject = stream;
        } else {
            if (typeof video.srcObject == "object") {
                video.srcObject = stream;
            } else {
                window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
                video.src = (window.URL && window.URL.createObjectURL(stream));
            }
        }

        return new Promise((resolve) => {
            let onPlaying = () => {
                resolve(new VideoTexture(`VideoTextureStream_${this.id}`, video, scene, true, false));
                video.removeEventListener("playing", onPlaying);
            };

            video.addEventListener("playing", onPlaying);
            video.play();
        });
    }

    _addTo(scene, stream) {
        this._CreateFromStreamAsync(scene, stream)
            .then(videoTexture => {
                this.mesh = this._getBox();
                this.mesh.material = this._getMaterial();

                var videoPanel = this._getVideoPanel();
                videoPanel.material = this._getVideoPanelMaterial(videoTexture);
                this.mesh.addChild(videoPanel);
                scene.addMesh(this.mesh);
                this._addSpatialAudio(stream, scene, this.mesh);
            });
    }
}