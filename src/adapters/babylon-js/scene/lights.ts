import { HemisphericLight, PointLight, Scene, Vector3 } from "@babylonjs/core";

export function addTo(scene: Scene, { ambient = true, sun = true }): void {
    if (ambient) {
        const ambientLight = new HemisphericLight(
            "hemisphericLight",
            new Vector3(0, 1, 0),
            scene
        );
        ambientLight.intensity = 0.3;
    }
    if (sun) {
        const sunLight = new PointLight(
            "pointLight",
            new Vector3(0, 999, 0),
            scene
        );
        sunLight.intensity = 2999999;
    }
}
