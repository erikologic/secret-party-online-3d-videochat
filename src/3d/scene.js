import {
    Color3,
    Scene,
    SceneLoader,
    Vector3,
    Mesh, ShadowGenerator
} from "@babylonjs/core";

import {SkyMaterial} from '@babylonjs/materials/sky';
import * as lights from "./lights";
import {getCamera} from "./camera";
import {getGround} from "./ground";

function setupScene(engine) {
    var scene = new Scene(engine);
    //Set gravity for the scene (G force like, on Y-axis)
    scene.gravity = new Vector3(0, -0.9, 0);

    // Enable Collisions
    scene.collisionsEnabled = true;
    scene.audioPositioningRefreshRate = 8;
    return scene;
}

export function createScene(engine, canvas) {
    var scene = setupScene(engine);
    const light = lights.addTo(scene);
    var shadowGenerator = new ShadowGenerator(1024, light);

    getCamera(scene, canvas);
    getGround(scene);

    SceneLoader.ImportMesh(
        "dragon",
        "https://models.babylonjs.com/Georgia-Tech-Dragon/",
        "dragon.babylon",
        scene,
        (objs) => {
            const dragon = objs[0]
            window.dragon = dragon;
            dragon.scaling = new Vector3(100, 100, 100)
            dragon.position = new Vector3(30, 0, -50);
            shadowGenerator.getShadowMap().renderList.push(dragon);
            shadowGenerator.usePoissonSampling = true; // TODO check performance
        });

    scene.clearColor = new Color3(80 / 256, 166 / 256, 255 / 256)

    var skyMaterial = new SkyMaterial("skyMaterial", scene);
    skyMaterial.backFaceCulling = false;
    skyMaterial.luminance = 1;
    skyMaterial.inclination = 0;
    skyMaterial.turbidity = 40;
    var skybox = Mesh.CreateBox("skyBox", 1000.0, scene);
    skybox.material = skyMaterial;

    return scene;
}