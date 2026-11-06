import { useEffect, useState } from "react";
import { signup, login } from "../api";
import { Navigate, useNavigate } from "react-router-dom";

const Form = ({ page, onAuthenticated }) => {
  const isSignup = page === "signup";
  const [loginPage, setLoginPage] = useState("login");
  useEffect(() => {
    if (page === "signup") {
      setLoginPage("signup");
    }
  }, [page]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      if (isSignup) {
        await signup(username, email, password);
        setMessage("Account created ! you can login now");
        // setLoginPage("login");
      } else {
        const data = await login(username, password);
        onAuthenticated?.(data.user ?? data);
        navigate("/");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="absolute inset-0 flex overflow-y-auto px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-secondary m-auto w-full max-w-md p-6 sm:p-10 rounded-2xl shadow-2xl border border-white/10"
        >
          <div className="flex flex-col gap-4">
            <h1 className="text-center text-2xl sm:text-3xl font-bold capitalize mb-2">
              {page}
            </h1>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium">
                userName
              </label>
              <input
                id="username"
                type="text"
                placeholder="name"
                className="bg-primary p-3 rounded-xl border border-transparent outline-none transition focus:border-pop-alt focus:ring-2 focus:ring-pop-alt/30"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {isSignup && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="bg-primary p-3 rounded-xl border border-transparent outline-none transition focus:border-pop-alt focus:ring-2 focus:ring-pop-alt/30"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                password
              </label>
              <input
                id="password"
                type="password"
                className="bg-primary p-3 rounded-xl border border-transparent outline-none transition focus:border-pop-alt focus:ring-2 focus:ring-pop-alt/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {message && (
              <p role="status" className="text-sm text-center">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-pop-alt p-3 mt-2 font-bold capitalize rounded-xl cursor-pointer transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "please wait..." : page}
            </button>
            <div className="text-center text-sm">
              {loginPage === "login" ? (
                <p>
                  Don't have a account? Click here to{" "}
                  <a
                    href="/signup"
                    className="text-pop-alt font-medium hover:underline"
                  >
                    sign up.
                  </a>
                </p>
              ) : (
                <p>
                  already have an account? Click here to{" "}
                  <a
                    href="/login"
                    className="text-pop-alt font-medium hover:underline"
                  >
                    login.
                  </a>
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Form;
