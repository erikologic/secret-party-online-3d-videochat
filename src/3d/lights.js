import {PointLight, Vector3} from "@babylonjs/core";

export function addTo(scene) {
    // Lights
    return new PointLight("pointLight", new Vector3(0, 999, 0), scene);
}