import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctor" element={<Doctor />} />
        <Route path="/patient" element={<Patient />} />
        <Route path="/call/:room" element={<VideoCall />} />
      </Routes>
    </Router>
  );
};

// Home Component
const Home = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.homeContainer}>
      <h1>Welcome to Video Call App</h1>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => navigate("/doctor")}>
          Join as Doctor
        </button>
        <button style={styles.button} onClick={() => navigate("/patient")}>
          Join as Patient
        </button>
      </div>
    </div>
  );
};

// Doctor Component
const Doctor = () => {
  const navigate = useNavigate();
  const doctorId = "doctor_suresh";
  const patients = ["ravi", "shreya"];

  return (
    <div style={styles.container}>
      <h1>Doctor Portal</h1>
      <p>Doctor ID: {doctorId}</p>
      <ul>
        {patients.map((patient) => (
          <li key={patient}>
            {patient}{" "}
            <button
              style={styles.button}
              onClick={() => navigate(`/call/${doctorId}-${patient}`)}
            >
              Join Call with {patient}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Patient Component
const Patient = () => {
  const navigate = useNavigate();
  const patientName = "ravi";
  const doctorId = "doctor_suresh";

  return (
    <div style={styles.container}>
      <h1>Patient Portal</h1>
      <p>Patient Name: {patientName}</p>
      <p>Doctor: {doctorId}</p>
      <button
        style={styles.button}
        onClick={() => navigate(`/call/${doctorId}-${patientName}`)}
      >
        Join Call
      </button>
    </div>
  );
};

// VideoCall Component
const VideoCall = () => {
  const { room } = useParams();
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const chatMessages = useRef(null);
  const chatInput = useRef(null);
  const socket = io("http://localhost:5000"); // Replace with your backend URL

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
  }, [room]);

  const sendChatMessage = () => {
    const message = chatInput.current.value.trim();
    if (message) {
      socket.emit("chat_message", { room, message });
      chatMessages.current.innerHTML += `<div style="text-align: right; color: blue;">${message}</div>`;
      chatInput.current.value = "";
    }
  };

  useEffect(() => {
    socket.on("chat_message", (data) => {
      chatMessages.current.innerHTML += `<div style="text-align: left; color: green;">${data.message}</div>`;
    });
  }, []);

  return (
    <div style={styles.container}>
      <h1>Video Call Room: {room}</h1>
      <div style={styles.videoContainer}>
        <video ref={localVideo} autoPlay muted style={styles.video}></video>
        <video ref={remoteVideo} autoPlay style={styles.video}></video>
      </div>
      <div style={styles.chatBox}>
        <div ref={chatMessages} style={styles.chatMessages}></div>
        <div style={styles.chatInputContainer}>
          <input ref={chatInput} placeholder="Type a message..." style={styles.chatInput} />
          <button onClick={sendChatMessage} style={styles.button}>
            Send
          </button>
        </div>
      </div>
      <footer style={styles.footer}>
        <button style={styles.button}>🎤 Mute</button>
        <button style={styles.button}>📷 Video Off</button>
        <button style={styles.button}>📺 Share Screen</button>
        <button style={styles.button}>💬 Chat</button>
        <button style={styles.button}>❌ End Call</button>
      </footer>
    </div>
  );
};

// Styles
const styles = {
  homeContainer: {
    textAlign: "center",
    marginTop: "50px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "30px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "#fff",
    transition: "0.3s",
  },
  container: {
    textAlign: "center",
    marginTop: "30px",
  },
  videoContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  },
  video: {
    width: "45%",
    borderRadius: "10px",
    backgroundColor: "#000",
  },
  chatBox: {
    marginTop: "20px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fff",
    width: "300px",
    margin: "20px auto",
  },
  chatMessages: {
    height: "150px",
    overflowY: "auto",
    marginBottom: "10px",
  },
  chatInputContainer: {
    display: "flex",
    gap: "10px",
  },
  chatInput: {
    flex: 1,
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
  footer: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
};

export default App;
