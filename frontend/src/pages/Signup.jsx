import React, { useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { signupUser } from "../services/courseService";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signupUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      toast.success("Signup Successful");

      setName("");
      setEmail("");
      setPassword("");

      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="signup-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2 style={{ textAlign: "center", marginBottom: "6px", color: "#111827" }}>
            Create Account
          </h2>

          <div>
            <label>UserName</label>
            <input
              type="text"
              placeholder="Enter username"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary full-btn">
            Sign Up
          </button>

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </>
  );
}

export default Signup;