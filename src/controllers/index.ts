import { RoomController } from "../domain/room-controller";
import { RemoteRoomSwarmSignalHub } from "../adapters/webrtc-swarm/remote-room";
import { VirtualWorldBabylonJs } from "../adapters/babylon-js/virtual-world-babylon-js";
import { LocalBrowser } from "../adapters/browser/local-browser";

console.log("config", {
    HUB_URL: process.env.HUB_URL,
    TURN_IP: process.env.TURN_IP,
});

function init(): void {
    const local = new LocalBrowser();
    const remoteRoom = new RemoteRoomSwarmSignalHub();
    const virtualWorld = new VirtualWorldBabylonJs();
    const roomController = new RoomController(local, remoteRoom, virtualWorld);
    roomController.join();
}

const startButton = document.getElementById("startButton");
startButton?.addEventListener("click", init);
