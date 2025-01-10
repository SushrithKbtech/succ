import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1>Welcome to Video Call App</h1>
      <div className="button-container">
        <button className="home-button" onClick={() => navigate("/doctor")}>
          Join as Doctor
        </button>
        <button className="home-button" onClick={() => navigate("/patient")}>
          Join as Patient
        </button>
      </div>
    </div>
  );
};

export default Home;
