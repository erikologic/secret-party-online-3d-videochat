import {Light, PointLight, Scene, Vector3} from "@babylonjs/core";
import {ShadowLight} from "@babylonjs/core/Lights/shadowLight";

export function addTo(scene: Scene): ShadowLight {
    return new PointLight("pointLight", new Vector3(0, 999, 0), scene);
}