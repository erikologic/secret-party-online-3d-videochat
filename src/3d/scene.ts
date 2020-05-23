// TODO disable inspector in production!!!
// import "@babylonjs/core/Debug/debugLayer";
// import "@babylonjs/inspector";

import {Color4, Engine, Scene, ShadowGenerator, Vector3} from "@babylonjs/core";

import * as lights from "./lights";
import {createCamera} from "./camera";
import {importMesh} from "./mesh-importer";
import {createSky} from "./sky";

const assetList = [
    "Amaca decimated compressed.glb",
    "Bar decimated.glb",
    "Bridge decimated compressed.glb",
    "Gazebo 1 decimated compressed.glb",
    "Isle Base compressed.glb",
    "Isle tent compressed.glb",
    "Lights decimated compressed.glb",
    "Perimeter.glb",
    "Poltrona 1 decimated compressed.glb",
    "Round poltrona compressed.glb",
    "Sofa decimated.glb",
    "Stool decimated compressed.glb",
    "Sun bed decimated compressed.glb",
    "Swimming pool decimated compressed.glb",
    "Tent.glb",
    "Tree decimated.glb",
    "Umbrella.glb",
    "Yakuzi decimated compressed.glb"
];

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

export function createScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
    const scene = setupScene(engine);
    const light = lights.addTo(scene);
    const shadowGenerator = new ShadowGenerator(1024, light);
    createSky(scene);
    createCamera(scene, canvas);

    assetList.forEach(filename => importMesh(scene, filename, shadowGenerator));
    
    // scene.debugLayer.show()
    return scene;
}