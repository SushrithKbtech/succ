import React, { useEffect, useRef } from "react";
import io from "socket.io-client";
import "./styles.css";

const VideoCall = ({ room }) => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const chatbox = useRef(null);
  const chatMessages = useRef(null);
  const chatInput = useRef(null);
  const socket = io("http://localhost:5000"); // Replace with your backend server URL

  let localStream;
  let peerConnection;
  const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  useEffect(() => {
    socket.emit("join_room", { room });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      localStream = stream;
      localVideo.current.srcObject = stream;

      peerConnection = new RTCPeerConnection(configuration);

      stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("signal", { room, candidate: event.candidate });
        }
      };

      peerConnection.ontrack = (event) => {
        remoteVideo.current.srcObject = event.streams[0];
      };

      socket.on("signal", (data) => {
        if (data.sdp) {
          peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
          if (data.sdp.type === "offer") {
            peerConnection.createAnswer().then((answer) => {
              peerConnection.setLocalDescription(answer);
              socket.emit("signal", { room, sdp: answer });
            });
          }
        } else if (data.candidate) {
          peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
      });

      peerConnection.createOffer().then((offer) => {
        peerConnection.setLocalDescription(offer);
        socket.emit("signal", { room, sdp: offer });
      });
    });
  }, [room, socket]);

  const sendChatMessage = () => {
    const message = chatInput.current.value.trim();
    if (message) {
      socket.emit("chat_message", { room, message });
      chatMessages.current.innerHTML += `<div class="message self">${message}</div>`;
      chatInput.current.value = "";
    }
  };

  useEffect(() => {
    socket.on("chat_message", (data) => {
      chatMessages.current.innerHTML += `<div class="message other">${data.message}</div>`;
    });
  }, [socket]);

  return (
    <div>
      <h1>Video Call Room: {room}</h1>
      <div className="video-container">
        <video ref={localVideo} autoPlay muted></video>
        <video ref={remoteVideo} autoPlay></video>
      </div>
      <div ref={chatbox} className="chat hidden">
        <div ref={chatMessages} className="chat-messages"></div>
        <div className="chat-input">
          <input type="text" ref={chatInput} placeholder="Type a message..." />
          <button onClick={sendChatMessage}>Send</button>
        </div>
      </div>
      <footer className="call-footer">
        <button>🎤 Mute</button>
        <button>📷 Video Off</button>
        <button>📺 Share Screen</button>
        <button>💬 Chat</button>
        <button>❌ End Call</button>
      </footer>
    </div>
  );
};

export default VideoCall;
