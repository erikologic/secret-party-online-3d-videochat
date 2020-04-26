import * as BABYLON from "babylonjs";
import * as LOADERS from '@babylonjs/loaders'
import * as lights from "./lights";
import {getCamera} from "./camera";
import {getGround} from "./ground";

function setupScene(engine) {
    var scene = new BABYLON.Scene(engine);
    //Set gravity for the scene (G force like, on Y-axis)
    scene.gravity = new BABYLON.Vector3(0, -0.9, 0);

    // Enable Collisions
    scene.collisionsEnabled = true;
    scene.audioPositioningRefreshRate = 8;
    return scene;
}

export function createScene(engine, canvas) {
    var scene = setupScene(engine);
    lights.addTo(scene);
    getCamera(scene, canvas);
    getGround(scene);

    BABYLON.SceneLoader.ImportMesh(
        "dragon",
        "https://models.babylonjs.com/Georgia-Tech-Dragon/",
        "dragon.babylon",
        scene,
        (objs) => {
            console.log(objs);
            const dragon = objs[0]
            window.dragon = dragon;
            dragon.scaling = new BABYLON.Vector3(100, 100, 100)
            dragon.position = new BABYLON.Vector3(30, 0, -50);
        });

    scene.clearColor = new BABYLON.Color3(80/256,166/256,255/256)
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;

    return scene;
}