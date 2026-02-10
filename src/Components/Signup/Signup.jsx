import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../Auth/Auth";

import logo from "../../assets/signupPageLogo.png";
import headingLogo from "../../assets/socialloop-logo.jpg";
import google from "../../assets/google.png";
import safari from "../../assets/safari.png";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function formSubmit(e) {
    e.preventDefault();

    // Basic validations
    if (!name || !email || !password || !confirmPassword) {
      Swal.fire("Error", "All fields are required", "error");
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }

    if (!agree) {
      Swal.fire("Error", "Please accept Terms & Conditions", "error");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (error) {
        throw error;
      }

      Swal.fire("Success", "Signup Successful 🎉", "success");
      navigate("/login");
    } catch (err) {
      Swal.fire("Signup Failed", err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">

      {/* Left Section */}
      <div className="hidden md:flex w-1/2 items-center justify-center px-8">
        <img src={logo} alt="Signup" className="max-w-lg" />
      </div>

      {/* Right Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4 sm:mt-20 text-black">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

          <img src={headingLogo} alt="Logo" className="w-60 mx-auto mb-4" />

          <h1 className="text-gray-600 text-2xl font-medium mb-6 text-center">
            Create Your Account
          </h1>

          <form onSubmit={formSubmit} className="space-y-4">

            {/* Social Buttons */}
            <div className="flex justify-between space-x-4">
              <button
                type="button"
                className="flex w-1/2 justify-center items-center px-4 py-2 border rounded-lg"
              >
                <img src={google} className="h-6 w-6 mr-2" alt="Google" />
                Google
              </button>

              <button
                type="button"
                className="flex w-1/2 justify-center items-center px-4 py-2 border rounded-lg"
              >
                <img src={safari} className="h-6 mr-2" alt="Safari" />
                Safari
              </button>
            </div>

            <input
              type="text"
              placeholder="Enter Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              type="email"
              placeholder="Enter Correct Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg"
            />

            {/* Terms & Conditions */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span className="text-sm text-gray-600">
                I agree to the Terms & Conditions
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#35B6C9] text-white font-semibold py-3 rounded-lg disabled:opacity-50"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Already have an account?
            <NavLink
              to="/login"
              className="text-blue-500 ml-1 hover:underline"
            >
              Log in
            </NavLink>
          </p>

        </div>
      </div>
    </div>
  );
}
