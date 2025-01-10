import React from "react";
import { useNavigate } from "react-router-dom";

const Patient = () => {
  const navigate = useNavigate();
  const patientName = "ravi"; // Replace with dynamic data if needed
  const doctorId = "doctor_suresh";

  return (
    <div>
      <h1>Patient Portal</h1>
      <p>Patient Name: {patientName}</p>
      <p>Doctor: {doctorId}</p>
      <button onClick={() => navigate(`/call/${doctorId}-${patientName}`)}>
        Join Call
      </button>
    </div>
  );
};

export default Patient;
