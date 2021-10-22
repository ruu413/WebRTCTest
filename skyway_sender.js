const Peer = require("skyway-js");
const peer = new Peer({
    key: "c07e8954-ce1b-4783-a45e-e8421ece83ce", 
    debug: 3});
let localVideo = document.getElementById('local_video');
let remoteVideo = document.getElementById('remote_video');
let localStream = null;
let peerConnection = null;

// --- prefix -----
navigator.getUserMedia  = navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia || navigator.msGetUserMedia;

RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;

async function getDeviceStream(option) {
    console.log('wrap navigator.getUserMadia with Promise');
    return new Promise(function(resolve, reject){                navigator.getUserMedia(option,
            resolve,
            reject
        );
    });
}
function playVideo(element, stream) {
    if ('srcObject' in element) {
        if (! element.srcObject) {
            element.srcObject = stream;
        }
        else {
            console.log('stream alreay playnig, so skip');
        }
    }
    else {
        element.src = window.URL.createObjectURL(stream);
    }
    element.play();
    element.volume = 0;
}
function isUseAudio(){return false;}
function isUseVideo(){return true;}

async function startVideo() {
    let useVideo = isUseVideo();
    let useAudio = isUseAudio();
    if ( (! useVideo) && (! useAudio) ) {
        console.warn('NO media to capture');
        return;
    }

    stream = await getDeviceStream({video: useVideo, audio: useAudio}) // audio: false
    //.then(function (stream) { // success
        //logStream('localStream', stream);
    localStream = stream;
    console.log(stream)
    playVideo(localVideo, stream);
    /*}).catch(function (error) { // error
        console.error('getUserMedia error:', error);
        return;
    });*/
}
startVideo();

peer.on("open", ()=>{
    
    webSocket = new WebSocket("wss://127.0.0.1:8081/");
    webSocket.onopen = () => {
        webSocket.send(JSON.stringify({
            "msg_type":"connect_sender",
            "peer_id": peer.id
    }))
    }
});
peer.on("call", mediaConnection =>{
    mediaConnection.answer(localStream);
});