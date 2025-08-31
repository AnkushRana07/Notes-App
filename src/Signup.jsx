import { Calendar } from "lucide-react";
import { useState } from "react";
import { api } from "./api";

export default function Signup({ onNext, onSignIn }) { // Changed from onBack to onSignIn
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  // Validation function
  const validate = (values) => {
    const newErrors = {};
    if (!values.name.trim()) newErrors.name = "Name is required";
    if (!values.dob.trim()) newErrors.dob = "Date of Birth is required";
    if (!values.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = "Invalid email format";
    }
    return newErrors;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setServerError("");
    setSubmitting(true);
    api('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ name: formData.name, dob: formData.dob, email: formData.email })
    })
      .then((data) => {
        if (data && data.previewUrl) {
          try { window.open(data.previewUrl, '_blank'); } catch {}
          console.log('OTP preview URL:', data.previewUrl);
        }
        onNext(formData); // Pass userData to next step
      })
      .catch((err) => setServerError(err.message || 'Failed to send OTP'))
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Sign Up */}
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
        <h2 className="text-3xl font-bold text-center mt-4 px-8">Sign up</h2>
        <p className="text-gray-500 text-center mt-1 text-sm sm:text-base px-8">
          Sign up to enjoy the feature of HD
        </p>

        {/* Form */}
        <form className="mt-6 space-y-5 px-8" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Your Name</label>
            <input
              type="text"
              placeholder="Jonas Khanwald"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="11 December 1997"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 pl-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Calendar className="absolute left-3 top-2.5 sm:top-3 text-gray-400 w-5 h-5" />
            </div>
            {errors.dob && (
              <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <input
              type="email"
              placeholder="jonas_kahnwald@gmail.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-500 disabled:opacity-60 text-white py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-blue-600 transition"
          >
            {submitting ? 'Sending...' : 'Get OTP'}
          </button>
        </form>

        {serverError && (
          <p className="text-center text-sm text-red-600 mt-3 px-8">{serverError}</p>
        )}

        {/* Footer */}
        <p className="text-center text-sm sm:text-base text-gray-600 mt-5 px-8">
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-500 font-medium hover:underline"
            onClick={onSignIn}
          >
            Sign in
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
