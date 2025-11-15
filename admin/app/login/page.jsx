"use client";
import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import Cookies from "js-cookie";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      console.log("✅ Login Response:", res);

      // ✅ Ensure it's admin
      if (res.user.role === "admin") {
        Cookies.set("adminToken", res.token, { expires: 1 }); 
        router.push("/dashboard");
      } else {
        setError("Access denied. Admins only!");
      }
    } catch (err) {
      setError(err.message || "Login failed!");
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
        >
          Login
        </button>
      </form>
    </div>
  );
}
