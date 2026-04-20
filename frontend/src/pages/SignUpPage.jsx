import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2 } from "lucide-react"; // optional spinner, keep or replace
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = validateForm();
    if (success === true) signup(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                {/* keep your logo component here */}
                <div className="text-primary">💬</div>
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">Get started with your free account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center w-10 justify-center pointer-events-none z-10">
      <FontAwesomeIcon icon={faUser} className="text-gray-400 w-5 h-5" />
    </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center w-10 justify-center pointer-events-none z-10">
    <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-5 h-5" />
  </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center w-10 justify-center pointer-events-none z-10">
    <FontAwesomeIcon icon={faLock} className="text-gray-400 w-5 h-5" />
  </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="•••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon
                    icon={showPassword ? faEyeSlash : faEye}
                    className="text-gray-400 w-5 h-5"
                  />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
{/* right side / illustration */}
<div className="hidden lg:flex bg-base-200 items-center justify-center">
  <div className="max-w-md text-center space-y-6 px-10">
    
    {/* Big Icon */}
    <div className="flex justify-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
        <FontAwesomeIcon
          icon={faUser}
          className="text-primary text-4xl"
        />
      </div>
    </div>

    {/* Heading */}
    <h2 className="text-3xl font-bold">
      Join Our Community
    </h2>

    {/* Description */}
    <p className="text-base-content/70">
      Create an account to chat, collaborate, and connect with people in real time.
    </p>

    {/* Feature list */}
    <div className="space-y-4 text-left">
      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={faEnvelope} className="text-primary w-5 h-5" />
        <span>Secure messaging</span>
      </div>

      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={faLock} className="text-primary w-5 h-5" />
        <span>End-to-end privacy</span>
      </div>

      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={faUser} className="text-primary w-5 h-5" />
        <span>Personal profiles</span>
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default SignUpPage;
