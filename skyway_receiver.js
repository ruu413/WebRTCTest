const Peer = require("skyway-js");

let localVideo = document.getElementById("local_video");
let remoteVideo = document.getElementById("remote_video");
let localStream = null;
let peerConnection = null;
//Peer.on("open", () => {});
// --- prefix -----
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

RTCPeerConnection =
  window.RTCPeerConnection ||
  window.webkitRTCPeerConnection ||
  window.mozRTCPeerConnection;
RTCSessionDescription =
  window.RTCSessionDescription ||
  window.webkitRTCSessionDescription ||
  window.mozRTCSessionDescription;

function playVideo(element, stream) {
  if ("srcObject" in element) {
    if (!element.srcObject) {
      element.srcObject = stream;
    } else {
      console.log("stream alreay playnig, so skip");
    }
  } else {
    element.src = window.URL.createObjectURL(stream);
  }
  element.play();
  element.volume = 0;
}
const webSocket = new WebSocket("wss://127.0.0.1:8081/");

let mediaConnection = null;
let peer = null;
webSocket.onmessage = (event) => {
  let message = JSON.parse(event.data);
  console.log(message);
  peer_id = message["peer_id"];
  mediaConnection = peer.call(peer_id);
  mediaConnection.on("stream", (stream) => {
    console.log("on stream");
    playVideo(remoteVideo, stream);
  });
};
webSocket.onopen = () => {
  peer = new Peer({
    key: "c07e8954-ce1b-4783-a45e-e8421ece83ce",
    debug: 3,
  });
  peer.on("open", () => {
    webSocket.send(
      JSON.stringify({
        msg_type: "connect_receiver",
      })
    );
  });
};
