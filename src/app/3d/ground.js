import * as BABYLON from "babylonjs";

export function getGround(scene) {
    //Ground
    var ground = BABYLON.Mesh.CreatePlane("ground", 5000.0, scene);
    ground.material = new BABYLON.StandardMaterial("groundMat", scene);
    ground.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    ground.material.backFaceCulling = false;
    ground.position = new BABYLON.Vector3(5, 0, -15);
    ground.rotation = new BABYLON.Vector3(Math.PI / 2, 0, 0);

    //finally, say which mesh will be collisionable
    ground.checkCollisions = true;

    return ground;
}