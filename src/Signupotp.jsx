import { Calendar, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { api, saveAuth } from "./api";

export default function Signupotp({ onSignIn, userData, onBack }) {
  const [showOtp, setShowOtp] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || "",
    dob: userData?.dob || "",
    email: userData?.email || "",
    otp: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError("");
    setSubmitting(true);
    api('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: formData.email, otp: formData.otp, name: formData.name, dob: formData.dob })
    })
      .then(({ token, user }) => {
        saveAuth({ token, user });
        onSignIn({ user }); // Pass the correct format
      })
      .catch((err) => setServerError(err.message || 'OTP verification failed'))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Sign Up OTP */}
      <div className="w-[375px] min-h-screen bg-white shadow-lg flex flex-col">
        {/* Logo + Title */}
        <div className="flex flex-col items-center p-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            className="w-8 h-8 text-blue-500"
            fill="currentColor"
          >
            <circle cx="100" cy="100" r="40" fill="white" />
            {Array.from({ length: 12 }).map((_, i) => (
              <rect
                key={i}
                x={95}
                y={20}
                width="10"
                height="40"
                transform={`rotate(${i * 30} 100 100)`}
                fill="currentColor"
              />
            ))}
          </svg>
          <h1 className="text-xl font-semibold mt-2">HD</h1>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mt-4 px-8">Verify OTP</h2>
        <p className="text-gray-500 text-center mt-1 text-sm sm:text-base px-8">
          Enter the OTP sent to your email
        </p>

        {/* Form */}
        <form className="mt-6 space-y-5 px-8" onSubmit={handleSubmit}>
          {/* Name (read-only) */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Your Name</label>
            <input
              type="text"
              value={formData.name}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 text-sm sm:text-base bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Date of Birth (read-only) */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Date of Birth</label>
            <div className="relative">
              <input
                type="text"
                value={formData.dob}
                readOnly
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 pl-10 text-sm sm:text-base bg-gray-100 cursor-not-allowed"
              />
              <Calendar className="absolute left-3 top-2.5 sm:top-3 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              readOnly
              className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 text-sm sm:text-base bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* OTP (editable) */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">OTP</label>
            <div className="relative">
              <input
                type={showOtp ? "text" : "password"}
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 pr-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowOtp(!showOtp)}
                className="absolute right-3 top-2.5 sm:top-3 text-gray-500"
              >
                {showOtp ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-500 disabled:opacity-60 text-white py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-blue-600 transition"
          >
            {submitting ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        {serverError && (
          <p className="text-center text-sm text-red-600 mt-3 px-8">{serverError}</p>
        )}

        {/* Footer */}
        <p className="text-center text-sm sm:text-base text-gray-600 mt-5 px-8">
          <button
            type="button"
            className="text-blue-500 font-medium hover:underline"
            onClick={onBack}
          >
            ← Back to Sign Up
          </button>
        </p>
      </div>
       {/* Right Side Image - Desktop Only */}
       <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 items-center justify-center relative overflow-hidden">
        {/* Background Image */}
        <img 
          src="/image/desktopimage.jpg" 
          alt="Abstract blue waves background"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        </div>
    </div>
  );
}
