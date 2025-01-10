import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Doctor from "./components/Doctor";
import Patient from "./components/Patient";
import VideoCall from "./components/VideoCall";

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

export default App;
