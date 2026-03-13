import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import { loginUser } from "../services/courseService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      const { token, user } = res;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login Successful");

      if (user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login frontend error:", err);
      toast.error(err.response?.data?.message || err.message || "Login failed");
    }
  };

  return (
    <>
      <Navbar />

      <div className="signup-container">
        <form className="signup-form" onSubmit={handleLogin}>
          <h2 style={{ textAlign: "center", marginBottom: "6px", color: "#111827" }}>
            Login
          </h2>

          <div>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary full-btn">
            Login
          </button>

          <p>
            Don't have an account? <Link to="/signup">Signup</Link>
          </p>
        </form>
      </div>
    </>
  );
}

export default Login;