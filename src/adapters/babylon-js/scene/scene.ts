// TODO disable inspector in production!!!
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";

import {
    Color3,
    Color4,
    Engine,
    Mesh,
    PBRMaterial,
    Scene,
    Vector3,
} from "@babylonjs/core";

import * as lights from "./lights";
import { createCamera } from "./camera";
import { createSky } from "./sky";
import { loadAssets } from "./load-assets";

function setupScene(engine: Engine): Scene {
    const scene = new Scene(engine);
    scene.clearColor = new Color4(80 / 256, 166 / 256, 255 / 256, 1);

    //Set gravity for the scene (G force like, on Y-axis)
    scene.gravity = new Vector3(0, -0.9, 0);

    // Enable Collisions
    scene.collisionsEnabled = true;
    scene.audioPositioningRefreshRate = 8;
    return scene;
}

function addGround(scene: Scene) {
    const ground = Mesh.CreateGround("ground", 100, 100, 2, scene);
    const groundMaterial = new PBRMaterial("groundMaterial", scene);
    groundMaterial.albedoColor = Color3.FromHexString("#1b5b1a");
    groundMaterial.metallic = 0.01;
    groundMaterial.backFaceCulling = false;
    ground.material = groundMaterial;
    ground.checkCollisions = true;
    ground.position.y = -1;
    // hidden ground
    const seaGround = Mesh.CreateGround("seaGround", 500, 500, 2, scene);
    const seaGroundMaterial = new PBRMaterial("seaGroundMaterial", scene);
    seaGroundMaterial.albedoColor = Color3.FromHexString("#22A2F8");
    seaGroundMaterial.metallic = 0.01;
    seaGroundMaterial.backFaceCulling = false;
    seaGround.material = seaGroundMaterial;
    seaGround.checkCollisions = true;
    seaGround.position.y = -25;
}

export function createScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
    const scene = setupScene(engine);
    lights.addTo(scene);
    createSky(scene);
    createCamera(scene, canvas);
    loadAssets(scene);
    addGround(scene);
    // scene.debugLayer.show()
    return scene;
}
