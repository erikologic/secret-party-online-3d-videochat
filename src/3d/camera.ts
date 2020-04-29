import {CustomDeviceOrientationCamera} from "./CustomDeviceOrientationCamera";
import {Scene, UniversalCamera, Vector3} from '@babylonjs/core';

const isMobile = window.orientation !== 'undefined';

const setMobileCamera = (initialPosition: Vector3, scene: Scene) => {
    const camera = new CustomDeviceOrientationCamera("DevOr_camera", initialPosition, scene);
    camera.enableHorizontalDragging();
    return camera;
};

const setDesktopCamera = (initialPosition: Vector3, scene: Scene) => new UniversalCamera("DevOr_camera", initialPosition, scene);

export function getCamera(scene: Scene, canvas: HTMLCanvasElement): void {
    const initialPosition =  new Vector3(0, 2, 0);
    // const camera = new CustomDeviceOrientationCamera("DevOr_camera", initialPosition, scene);
    const camera = isMobile 
        ? setMobileCamera(initialPosition, scene)
        : setDesktopCamera(initialPosition, scene);
    scene.activeCamera = camera;
    camera.attachControl(canvas, true);

    //Set the ellipsoid around the camera (e.g. your player's size)
    camera.ellipsoid = new Vector3(1,1,1);
    
    //Then apply collisions and gravity to the active camera
    camera.checkCollisions = true;
    camera.applyGravity = true;
}