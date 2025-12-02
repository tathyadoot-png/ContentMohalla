"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import api from "@/utils/api"; // axios instance (withCredentials: true)

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verify session by asking server for current user — httpOnly cookie will be sent automatically
  const verifySession = async () => {
    try {
      const res = await api.get("/auth/me");
      // assume server returns { user: { ... } } or user directly
      const user = res.data?.user ?? res.data ?? null;
      return user;
    } catch (err) {
      // not authenticated / session invalid
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // `login` should perform the credential exchange (and server should set httpOnly cookie)
      await login(email, password);

      // After login, verify server-side session (cookie)
      const apiUser = await verifySession();

      if (!apiUser) {
        // session cookie not present or invalid
        setError(
          "सत्र सत्यापित नहीं हुआ — सर्वर ने cookie नहीं सेट किया या cookie अवैध है। DevTools → Network में login response के headers देखें।"
        );
        console.error("Login returned, but /auth/me returned null. Server cookie may be missing.");
        setLoading(false);
        return;
      }

      // Ensure role is admin before routing
      if (apiUser.role === "admin") {
        router.push("/dashboard");
      } else {
        setError("Access denied. Admins only!");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <form
        onSubmit={handleSubmit}
        className="bg-card p-8 rounded shadow-md w-96 border border-custom"
      >
        <h1 className="text-2xl font-bold mb-4 text-primary">Admin Login</h1>
        {error && <p className="text-accent mb-2">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border border-custom rounded bg-muted text-primary placeholder:text-primary"
          required
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-custom rounded bg-muted text-primary placeholder:text-primary"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-primary"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-accent text-secondary p-2 rounded hover-accent transition-colors"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
