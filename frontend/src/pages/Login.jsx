import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

import { googleLogin } from "../services/authApi";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleGoogleSuccess(
    credentialResponse
  ) {
    try {
      if (!credentialResponse.credential) {
        throw new Error(
          "Google credential was not received"
        );
      }

      const user = await googleLogin(
        credentialResponse.credential
      );

      login(user);

      navigate("/");
    } catch (error) {
      console.error(
        "Google login failed:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Google login failed. Please try again."
      );
    }
  }

  function handleGoogleError() {
    console.error("Google Login Failed");
    alert("Google login failed. Please try again.");
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-2xl p-8">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-xl font-bold">
              R
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">
              Welcome to ReachInbox
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Sign in to manage your email campaigns
            </p>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              width="350"
              text="signin_with"
            />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-400 mt-8">
            Secure authentication powered by Google
          </p>

        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          ReachInbox Email Scheduler
        </p>

      </div>
    </div>
  );
}

export default Login;