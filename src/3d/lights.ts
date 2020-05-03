import {HemisphericLight, Light, PointLight, Scene, Vector3} from "@babylonjs/core";
import {ShadowLight} from "@babylonjs/core/Lights/shadowLight";

export function addTo(scene: Scene): HemisphericLight {
    const light = new HemisphericLight("hemisphericLight", new Vector3(0, 1, 0), scene);
    // const light = new PointLight("pointLight", new Vector3(0, 999, 0), scene);
    // light.intensity = 9999999;
    return light;
}