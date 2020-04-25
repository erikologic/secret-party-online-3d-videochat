import {ThreeD} from "./3d";
import {Network} from "./network";
import {getLocalStream, showLocalVideoStream} from "./local-stream";

window.init = function () {
    var overlay = document.getElementById( 'overlay' );
    overlay.remove();

    const myThreeD = new ThreeD();
    myThreeD.startEngine();

    getLocalStream()
        .then(localStream => {
            showLocalVideoStream(localStream);

            const networkLayer = new Network({
                onPeerConnect: (peer, id) => {
                    myThreeD.addPeer(peer, id);
                    peer.addStream(localStream);
                },
                onPeerDisconnect: (peer, id) => {
                    myThreeD.removePeer(id);
                }
            });
            networkLayer.connect();
        })
        .catch(console.log);
};


