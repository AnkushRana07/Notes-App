import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { api, saveAuth } from "./api";

export default function Signin({ onSwitch, onSignIn }) {
  const [showOtp, setShowOtp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [serverError, setServerError] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setServerError("");
    setInfoMsg("");
    if (!validateEmail(formData.email)) {
      setServerError("Enter a valid email");
      return;
    }
    setRequesting(true);
    api('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email: formData.email })
    })
      .then((data) => {
        setInfoMsg('OTP sent to your email');
        if (data && data.previewUrl) {
          try { window.open(data.previewUrl, '_blank'); } catch {}
          // eslint-disable-next-line no-console
          console.log('OTP preview URL:', data.previewUrl);
        }
      })
      .catch((err) => setServerError(err.message || 'Failed to send OTP'))
      .finally(() => setRequesting(false));
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setServerError("");
    if (!validateEmail(formData.email)) {
      setServerError("Enter a valid email");
      return;
    }
    if (!formData.otp) {
      setServerError("Enter the OTP sent to your email");
      return;
    }
    setVerifying(true);
    api('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email: formData.email, otp: formData.otp })
    })
      .then(({ token, user }) => {
        saveAuth({ token, user });
        onSignIn(user);
      })
      .catch((err) => setServerError(err.message || 'Invalid OTP'))
      .finally(() => setVerifying(false));
  };

  const GoogleButton = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleSignIn = async () => {
      setError("");
      setLoading(true);
      
      try {
        // For now, use a simple approach that works without Google Cloud Console
        // This simulates Google sign-in for development
        const email = prompt('Enter your Google email (for testing):');
        const name = prompt('Enter your name (for testing):');
        
        if (!email) {
          setLoading(false);
          return;
        }

        // Call our backend with the email/name
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email,
            name: name || 'Google User'
          })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Google sign-in failed');
        
        saveAuth({ token: data.token, user: data.user });
        onSignIn(data.user);
      } catch (e) {
        setError(e.message || 'Google sign-in failed');
        console.error('Google sign-in error:', e);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <button 
          type="button" 
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white border border-gray-300 mt-3 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-60"
        >
          {loading ? 'Connecting…' : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google (Test Mode)
            </>
          )}
        </button>
        {error && <p className="text-center text-sm text-red-600 mt-2">{error}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar - Sign In */}
      <div className="w-[375px] min-h-screen bg-white shadow-lg flex flex-col">
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
        <h2 className="text-3xl font-bold text-center mt-4 px-8">Sign in</h2>
        <p className="text-gray-500 text-center mt-1 text-sm sm:text-base px-8">
          Sign in to your account
        </p>
        <form className="mt-6 space-y-5 px-8" onSubmit={handleVerify}>
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
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">OTP</label>
            <div className="relative">
              <input
                type={showOtp ? "text" : "password"}
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={(e) =>
                  setFormData({ ...formData, otp: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 sm:py-3 pr-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 sm:top-3 text-gray-400"
                onClick={() => setShowOtp((prev) => !prev)}
                tabIndex={-1}
              >
                {showOtp ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={requesting}
              className="w-1/2 bg-gray-100 text-gray-800 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-200 transition disabled:opacity-60"
            >
              {requesting ? 'Sending…' : 'Request OTP'}
            </button>
            <button
              type="submit"
              disabled={verifying}
              className="w-1/2 bg-blue-500 text-white py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base hover:bg-blue-600 transition disabled:opacity-60"
            >
              {verifying ? 'Verifying…' : 'Sign in'}
            </button>
          </div>
          {serverError && (
            <p className="text-center text-sm text-red-600">{serverError}</p>
          )}
          {infoMsg && (
            <p className="text-center text-sm text-green-600">{infoMsg}</p>
          )}
        </form>
        <div className="px-8 mt-4">
          <GoogleButton />
        </div>
        <p className="text-center text-sm sm:text-base text-gray-600 mt-5 px-8">
          Don't have an account?{" "}
          <button
            type="button"
            className="text-blue-500 font-medium hover:underline"
            onClick={onSwitch}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
