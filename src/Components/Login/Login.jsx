import React, { useState } from "react";
import logo from "../../assets/signupPageLogo.png";
import headingLogo from "../../assets/socialloop-logo.jpg";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../Auth/Auth";
import Swal from "sweetalert2";
import google from '../../assets/google.png'
import safari from '../../assets/safari.png'

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  let navigate = useNavigate()

  async function formSubmit(e) {
    e.preventDefault();

    // 🔐 Basic validation
    if (!email || !password) {
      Swal.fire("Error", "All fields are required", "error");
      return;
    }
    setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
   })
    
    
    if (error) {
      Swal.fire("Signup Failed", error.message, "error");
    } else {
      Swal.fire(
        "Signup Successful 🎉",
        "Welcome to Socialloop Platform",
        "success"
      );
      navigate('/dashboard')
    }
    setLoading(false);
  }


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 items-center justify-center px-8">
        <img
          src={logo}
          alt="Signup"
          className="max-w-lg"
        />
      </div>

      {/* Right Section */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4 mt-20 text-black">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          
          <img
            src={headingLogo}
            alt="Logo"
            className="w-60 mx-auto mb-4"
          />

          <h1 className="text-gray-600 text-2xl font-medium mb-6 text-center">
            Login Your Account
          </h1>

         <form onSubmit={formSubmit} className="space-y-4">

  {/* Social Login Buttons */}
  <div className="flex justify-between space-x-4 mb-4">
    
    {/* Google Button */}
    <button
      type="button"
      className="flex items-center justify-center w-1/2 px-4 py-2 border rounded-lg hover:shadow-md transition"
    >
      <img src={google} alt="Google" className="h-8 w-8 mr-1" />
      <span className="text-sm font-medium">Google</span>
    </button>

    {/* Safari Button */}
    <button
      type="button"
      className="flex items-center justify-center w-1/2 px-4 py-1 border rounded-lg hover:shadow-md transition"
    >
      <img src={safari} alt="Safari" className="h-10 w-15 mr-1" />
      <span className="text-sm font-medium">Safari</span>
    </button>

  </div>

  {/* Email & Password */}
  <input
    onChange={(e) => setEmail(e.target.value)}
    type="email"
    placeholder="Email"
    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  <input
    onChange={(e) => setPassword(e.target.value)}
    type="password"
    placeholder="Password"
    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
  />

  {/* Submit Button */}
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-[#35B6C9] hover:bg-[#2aa3b5] text-white font-semibold py-3 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? "Login Account..." : "Login"}
  </button>
</form>


          <p className="text-sm text-gray-500 text-center mt-6">
            Create an account _
            <NavLink to="/signup">
              <span className="text-blue-500 ml-1 cursor-pointer hover:underline">
                Signup
              </span>
            </NavLink>
          </p>

        </div>
      </div>
    </div>
  );
}
