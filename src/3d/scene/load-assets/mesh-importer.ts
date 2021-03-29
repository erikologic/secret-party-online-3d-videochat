import "@babylonjs/loaders/glTF";
import {Scene, SceneLoader, ShadowGenerator} from "@babylonjs/core";

export function importMesh(scene: Scene, filename: string): void {
    SceneLoader.ImportMesh(
        "",
        "/asset/3d-app/3d-asset/",
        filename,
        scene,
        (objs) => {
            objs.forEach(obj => {
                // console.log("Imported ", obj.id, obj.name);
                obj.checkCollisions = true;
            });
        }, (event) => {
            // console.log(event);
        }, (scene, error) => {
            console.log(error)
        });
}