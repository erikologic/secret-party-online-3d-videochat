import { RoomController } from "../domain/room-controller";
import { RemoteRoomSwarmSignalHub } from "../adapters/webrtc-swarm/remote-room";
import { VirtualWorldBabylonJs } from "../adapters/babylon-js/virtual-world-babylon-js";
import { LocalBrowser } from "../adapters/browser/local-browser";
import { VirtualWordHtml } from "../adapters/virtual-world-html";

console.log("config", {
    HUB_URL: process.env.HUB_URL,
    TURN_IP: process.env.TURN_IP,
});

function init(): void {
    const url = new URL(document.URL);
    const useVirtualWorldHtml =
        url.searchParams.get("useVirtualWordHtml") === "true";
    const virtualWorld = useVirtualWorldHtml
        ? new VirtualWordHtml()
        : new VirtualWorldBabylonJs();

    const remoteRoom = new RemoteRoomSwarmSignalHub();
    const local = new LocalBrowser();
    const roomController = new RoomController(local, remoteRoom, virtualWorld);
    roomController.join().catch(console.error);
}

const startButton = document.getElementById("startButton");
startButton?.addEventListener("click", init);
