import {Mesh, StandardMaterial, Color3, Vector3} from "@babylonjs/core";

export function getGround(scene) {
    //Ground
    var ground = Mesh.CreatePlane("ground", 5000.0, scene);
    ground.material = new StandardMaterial("groundMat", scene);
    ground.material.diffuseColor = new Color3(1, 1, 1);
    ground.material.backFaceCulling = false;
    ground.position = new Vector3(5, 0, -15);
    ground.rotation = new Vector3(Math.PI / 2, 0, 0);

    //finally, say which mesh will be collisionable
    ground.checkCollisions = true;
    ground.receiveShadows = true;

    return ground;
}