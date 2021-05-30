import { CustomDeviceOrientationCamera } from "./CustomDeviceOrientationCamera";
import {
    Camera,
    FreeCamera,
    Scene,
    SceneOptimizer,
    SceneOptimizerOptions,
    Vector3,
    Animation,
    CircleEase,
    EasingFunction,
} from "@babylonjs/core";

const isMobile = window.orientation !== undefined;

const createMobileCamera = (
    initialPosition: Vector3,
    scene: Scene
): FreeCamera => {
    const camera = new CustomDeviceOrientationCamera(
        "Camera",
        initialPosition,
        scene
    );
    camera.enableHorizontalDragging();
    scene.getEngine().onResizeObservable.add((engine) => {
        const canvas = engine.getRenderingCanvas();
        if (canvas) {
            camera.fovMode =
                canvas.height > canvas.width
                    ? Camera.FOVMODE_VERTICAL_FIXED
                    : Camera.FOVMODE_HORIZONTAL_FIXED;
        }
    });
    new SceneOptimizer(scene, SceneOptimizerOptions.HighDegradationAllowed());
    return camera;
};

const addWASD = (camera: FreeCamera): void => {
    camera.keysUp.push(87);
    camera.keysDown.push(83);
    camera.keysLeft.push(65);
    camera.keysRight.push(68);
};

const addJump = (camera: FreeCamera, scene: Scene): void => {
    function jump() {
        camera.animations = [];
        const animation = new Animation(
            "a",
            "position.y",
            20,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        );
        const keys = [];
        keys.push({ frame: 0, value: camera.position.y });
        keys.push({ frame: 10, value: camera.position.y + 2 });
        keys.push({ frame: 20, value: camera.position.y });
        animation.setKeys(keys);
        const easingFunction = new CircleEase();
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        animation.setEasingFunction(easingFunction);
        camera.animations.push(animation);
        scene.beginAnimation(camera, 0, 60, false);
    }

    window.addEventListener("keydown", (event) => {
        switch (event.keyCode) {
            case 32:
                jump();
                break;
        }
    });
};

const createDesktopCamera = (
    initialPosition: Vector3,
    scene: Scene
): FreeCamera => {
    const camera = new FreeCamera("Camera", initialPosition, scene);
    camera.speed = 0.175;
    camera.inertia = 0.875;
    camera.angularSensibility = 6000;
    addWASD(camera);

    setTimeout(() => {
        addJump(camera, scene);
        window.addEventListener("click", () => {
            scene.getEngine().enterPointerlock();
        });
    }, 1000);

    return camera;
};

function setCameraPosition(camera: Camera) {
    const randomiseInitPos = (max: number, min: number) =>
        Math.abs(max - min) * Math.random() + Math.min(max, min);

    const xDimensions = [-36, 8] as const;
    const zDimensions = [-19, 11] as const;
    camera.position.x = randomiseInitPos(...xDimensions);
    camera.position.z = randomiseInitPos(...zDimensions);
    camera.position.y = 10;
}

export function createCamera(scene: Scene, canvas: HTMLCanvasElement): void {
    const initialPosition = new Vector3(0, 2, 0);
    console.log({ isMobile });
    const camera = isMobile
        ? createMobileCamera(initialPosition, scene)
        : createDesktopCamera(initialPosition, scene);
    scene.activeCamera = camera;
    camera.attachControl(canvas, true);

    camera.fov = 1.2;
    camera.minZ = 0;

    //Set the ellipsoid around the camera (e.g. your player's size)
    camera.ellipsoid = new Vector3(0.2, 0.8, 0.2);

    //Then apply collisions and gravity to the active camera
    camera.checkCollisions = true;
    camera.applyGravity = true;
    setCameraPosition(camera);
    camera.setTarget(new Vector3(0, 0, 0));
}
