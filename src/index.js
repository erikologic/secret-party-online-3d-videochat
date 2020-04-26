import {ThreeD} from "./3d";
import {Network} from "./network";
import {getLocalStream, showLocalVideoStream} from "./local-stream";

var startButton = document.getElementById('startButton');
startButton.addEventListener('click', init);

function init () {
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


