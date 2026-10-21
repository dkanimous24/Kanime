import { useState } from "react";
import { signup, login } from "../api";
import { Navigate, useNavigate } from "react-router-dom";

const Form = ({ page, onAuthenticated }) => {
  const isSignup = page === "signup";
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
      <div className=" absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <form
          onSubmit={handleSubmit}
          className="bg-secondary p-20 rounded-2xl w-150"
        >
          <div className="flex flex-col gap-3">
            <h1 className="text-center text-2xl font-bold">{page}</h1>
            <label htmlFor="username">userName</label>

            <input
              type="text"
              placeholder="name"
              className="bg-primary p-2 rounded-xl"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {isSignup && (
              <>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className="bg-primary p-2 rounded-xl"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </>
            )}
            <label htmlFor="password">password</label>
            <input
              type="password"
              className="bg-primary p-2 rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {message && <p role="status">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="bg-pop-alt p-4 font-bold rounded-xl"
            >
              {loading ? "please wait..." : page}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Form;
