import { useEffect, useState } from "react";
import { signup, login } from "../api";
import { Link, useNavigate } from "react-router-dom";

// Extract a readable message from different API error formats.
const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (data?.error?.message) {
    return data.error.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  // Handles errors thrown as JSON strings by API helpers.
  if (typeof error?.message === "string") {
    try {
      const parsed = JSON.parse(error.message);

      if (parsed?.error?.message) {
        return parsed.error.message;
      }

      if (typeof parsed?.detail === "string") {
        return parsed.detail;
      }

      if (typeof parsed?.message === "string") {
        return parsed.message;
      }
    } catch {
      // Not JSON; use the original readable error message.
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const Form = ({ page, onAuthenticated }) => {
  const isSignup = page === "signup";

  const [loginPage, setLoginPage] = useState("login");

  useEffect(() => {
    setLoginPage(isSignup ? "signup" : "login");
  }, [isSignup]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      if (isSignup) {
        await signup(username, email, password);

        setMessageType("success");
        setMessage("Account created successfully! You can log in now.");
      } else {
        const data = await login(username, password);

        onAuthenticated?.(data.user ?? data);
        navigate("/");
      }
    } catch (error) {
      setMessageType("error");
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex overflow-y-auto px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-secondary m-auto w-full max-w-md p-6 sm:p-10 rounded-2xl shadow-2xl border border-white/10"
      >
        <div className="flex flex-col gap-4">
          <h1 className="text-center text-2xl sm:text-3xl font-bold capitalize mb-2">
            {page}
          </h1>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Name"
              autoComplete="username"
              className="bg-primary p-3 rounded-xl border border-transparent outline-none transition focus:border-pop-alt focus:ring-2 focus:ring-pop-alt/30"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          {isSignup && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                className="bg-primary p-3 rounded-xl border border-transparent outline-none transition focus:border-pop-alt focus:ring-2 focus:ring-pop-alt/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="bg-primary p-3 rounded-xl border border-transparent outline-none transition focus:border-pop-alt focus:ring-2 focus:ring-pop-alt/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Modern feedback message */}
          {message && (
            <div
              role={messageType === "error" ? "alert" : "status"}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed ${
                messageType === "error"
                  ? "border-red-400/20 bg-red-500/10 text-red-300"
                  : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {messageType === "error" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path strokeLinecap="round" d="M12 7.5v5" />
                    <circle
                      cx="12"
                      cy="16"
                      r="0.8"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="size-5"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m8 12 2.5 2.5L16 9"
                    />
                  </svg>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {messageType === "error"
                    ? "Something went wrong"
                    : "Success!"}
                </p>

                <p className="mt-0.5 break-words">{message}</p>
              </div>

              <button
                type="button"
                onClick={() => setMessage("")}
                aria-label="Dismiss message"
                className="shrink-0 rounded-md p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="bg-pop-alt p-3 mt-2 font-bold capitalize rounded-xl cursor-pointer transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait..." : page}
          </button>

          {/* Navigation */}
          <div className="text-center text-sm">
            {loginPage === "login" ? (
              <p>
                Don't have an account? Click here to{" "}
                <Link
                  to="/signup"
                  className="text-pop-alt font-medium hover:underline"
                >
                  signup
                </Link>
              </p>
            ) : (
              <p>
                Already have an account? Click here to{" "}
                <Link
                  to="/login"
                  className="text-pop-alt font-medium hover:underline"
                >
                  login
                </Link>
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;
