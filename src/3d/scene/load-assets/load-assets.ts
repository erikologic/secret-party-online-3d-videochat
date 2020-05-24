import {Scene, ShadowGenerator} from "@babylonjs/core";
import {importMesh} from "./mesh-importer";

const assetList = [
    "Amaca decimated compressed.glb",
    "Bar decimated.glb",
    "Bridge decimated compressed.glb",
    "Gazebo 1 decimated compressed.glb",
    "Isle Base compressed.glb",
    "Isle tent compressed.glb",
    "Lights decimated compressed.glb",
    "Perimeter.glb",
    "Poltrona 1 decimated compressed.glb",
    "Round poltrona compressed.glb",
    "Sofa decimated.glb",
    "Stool decimated compressed.glb",
    "Sun bed decimated compressed.glb",
    "Swimming pool decimated compressed.glb",
    "Tent.glb",
    "Tree decimated.glb",
    "Umbrella.glb",
    "Yakuzi decimated compressed.glb"
];
export const loadAssets = (scene: Scene, shadowGenerator: ShadowGenerator) => assetList.forEach(filename => importMesh(scene, filename, shadowGenerator));