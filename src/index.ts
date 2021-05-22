import { RoomController } from "./domain/room-controller";
import { RemoteRoomSwarmSignalHub } from "./remote-room/remote-room";
import { VirtualWorldBabylonJs } from "./virtual-world/virtual-world-babylon-js";
import { LocalBrowser } from "./local/local";

console.log("config", {
    HUB_URL: process.env.HUB_URL,
    TURN_IP: process.env.TURN_IP,
});

function init(): void {
    const overlay = document.getElementById("overlay");
    overlay?.remove();

    const local = new LocalBrowser();
    const remoteRoom = new RemoteRoomSwarmSignalHub();
    const virtualWorld = new VirtualWorldBabylonJs();
    const roomController = new RoomController(local, remoteRoom, virtualWorld);
    roomController.join();
}

const startButton = document.getElementById("startButton");
startButton?.addEventListener("click", init);
