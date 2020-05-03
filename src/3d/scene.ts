import {
    Scene,
    SceneLoader,
    Vector3,
    Mesh, ShadowGenerator, Engine, Color4
} from "@babylonjs/core";
import  "@babylonjs/loaders/glTF";

import {SkyMaterial} from '@babylonjs/materials/sky';
import * as lights from "./lights";
import {getCamera} from "./camera";
import {getGround} from "./ground";

function setupScene(engine: Engine): Scene {
    const scene = new Scene(engine);
    //Set gravity for the scene (G force like, on Y-axis)
    scene.gravity = new Vector3(0, -0.9, 0);

    // Enable Collisions
    scene.collisionsEnabled = true;
    scene.audioPositioningRefreshRate = 8;
    return scene;
}

function importMesh(scene: Scene, filename: string ) {
    SceneLoader.ImportMesh(
        "",
        "/asset/",
        filename,
        scene,
        (objs) => {
            objs.forEach(obj => {
                console.log("Imported ", obj.id, obj.name);
                obj.checkCollisions = true;
                obj.receiveShadows = true;
                // shadowGenerator?.getShadowMap()?.renderList?.push(obj);
            });
        }, (event) => {
            console.log(event);
        }, (scene, error) => {
            console.log(error)
        });
}

export function createScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
    const scene = setupScene(engine);
    const light = lights.addTo(scene);
    // const shadowGenerator = new ShadowGenerator(1024, light);

    getCamera(scene, canvas);
    // getGround(scene);

    ["Bar decimated.glb", "Perimeter.glb", "Sofa decimated.glb", "Stool decimated compressed.glb", "Stool decimated.glb", "Tent.glb", "Tree decimated.glb", "Umbrella.glb"].forEach(filename => importMesh(scene, filename));
    
    // shadowGenerator.usePoissonSampling = true; // TODO check performance

    scene.clearColor = new Color4(80 / 256, 166 / 256, 255 / 256, 1);

    const skyMaterial = new SkyMaterial("skyMaterial", scene);
    skyMaterial.luminance = 1;
    skyMaterial.inclination = 0;
    skyMaterial.turbidity = 40;
    skyMaterial.backFaceCulling = false;
    const skybox = Mesh.CreateBox("skyBox", 1000, scene);
    skybox.material = skyMaterial;

    return scene;
}