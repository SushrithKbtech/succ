import React from "react";
import { useNavigate } from "react-router-dom";

const Doctor = () => {
  const navigate = useNavigate();
  const doctorId = "doctor_suresh"; // Replace with dynamic data if needed
  const patients = ["ravi", "shreya"];

  return (
    <div>
      <h1>Doctor Portal</h1>
      <p>Doctor ID: {doctorId}</p>
      <ul>
        {patients.map((patient) => (
          <li key={patient}>
            {patient}{" "}
            <button
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

export default Doctor;
