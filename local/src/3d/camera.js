import * as BABYLON from "babylonjs";
import {CustomDeviceOrientationCamera} from "./CustomDeviceOrientationCamera";

export function getCamera(scene, canvas) {
    const initialPosition =  new BABYLON.Vector3(0, 1, 0);
    const camera = new CustomDeviceOrientationCamera("DevOr_camera", initialPosition, scene);
    scene.activeCamera = camera;
    camera.attachControl(canvas, true);
    // createVirtualJoystick(scene, camera);
    // camera.inputs._deviceOrientationInput.
    // camera.inputs.addTouch();
    camera.enableHorizontalDragging();

    //Then apply collisions and gravity to the active camera
    camera.checkCollisions = true;
    camera.applyGravity = true;

    //Set the ellipsoid around the camera (e.g. your player's size)
    camera.ellipsoid = new BABYLON.Vector3(0.5,0.5,0.5);
}