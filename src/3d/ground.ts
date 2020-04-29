import {Mesh, StandardMaterial, Color3, Vector3, Scene} from "@babylonjs/core";

export function getGround(scene: Scene): Mesh {
    const ground = Mesh.CreatePlane("ground", 5000.0, scene);
    const material = new StandardMaterial("groundMat", scene);
    material.diffuseColor = new Color3(1, 1, 1);
    material.backFaceCulling = false;
    ground.material = material;
    ground.position = new Vector3(5, 0, -15);
    ground.rotation = new Vector3(Math.PI / 2, 0, 0);

    //finally, say which mesh will be collisionable
    ground.checkCollisions = true;
    ground.receiveShadows = true;

    return ground;
}