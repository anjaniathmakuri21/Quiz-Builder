
import { useState } from "react";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const users = JSON.parse(
      localStorage.getItem("quizUsers") || "[]"
    );

    if (isRegister) {
      if (!name.trim()) {
        setMessage("Please enter your name.");
        return;
      }

      const exists = users.some(
        (user) => user.email === email.trim().toLowerCase()
      );

      if (exists) {
        setMessage("This email is already registered.");
        return;
      }

      const newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      users.push(newUser);
      localStorage.setItem("quizUsers", JSON.stringify(users));
      localStorage.setItem("quizCurrentUser", JSON.stringify({
        name: newUser.name,
        email: newUser.email,
      }));

      onLogin({ name: newUser.name, email: newUser.email });
    } else {
      const user = users.find(
        (item) =>
          item.email === email.trim().toLowerCase() &&
          item.password === password
      );

      if (!user) {
        setMessage("Incorrect email or password.");
        return;
      }

      const loggedInUser = {
        name: user.name,
        email: user.email,
      };

      localStorage.setItem(
        "quizCurrentUser",
        JSON.stringify(loggedInUser)
      );

      onLogin(loggedInUser);
    }
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1 style={styles.logo}>
          Quiz<span style={{ color: "#7254ee" }}>Craft</span>
        </h1>

        <h2>{isRegister ? "Create your account" : "Welcome back!"}</h2>

        <p style={styles.subtitle}>
          {isRegister
            ? "Register to start creating quizzes."
            : "Login to continue to your quizzes."}
        </p>

        {isRegister && (
          <input
            style={styles.input}
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          style={styles.input}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password (minimum 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {message && <p style={styles.error}>{message}</p>}

        <button type="submit" style={styles.button}>
          {isRegister ? "Register" : "Login"}
        </button>

        <p style={styles.switchText}>
          {isRegister
            ? "Already have an account? "
            : "Don't have an account? "}

          <button
            type="button"
            style={styles.link}
            onClick={() => {
              setIsRegister(!isRegister);
              setMessage("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f6fc",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    boxSizing: "border-box",
    background: "white",
    padding: "32px",
    borderRadius: "18px",
    boxShadow: "0 8px 30px rgba(30, 30, 70, 0.08)",
  },
  logo: {
    textAlign: "center",
    color: "#252544",
  },
  subtitle: {
    color: "#77778b",
    marginBottom: "24px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px",
    marginBottom: "14px",
    border: "1px solid #dddded",
    borderRadius: "8px",
    fontSize: "15px",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#7254ee",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "#d93025",
    fontSize: "14px",
  },
  switchText: {
    textAlign: "center",
    marginTop: "22px",
    fontSize: "14px",
  },
  link: {
    border: "none",
    background: "none",
    color: "#7254ee",
    cursor: "pointer",
    fontWeight: "bold",
  },
};