"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AppNav } from "@/components/AppNav";
import { useUser } from "@/lib/hooks/useUser";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useUser();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const target = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    try {
      const response = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Something went wrong. Please retry.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("auth error", err);
      setError("Unable to reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <AppNav />
      <div className="container">
        <section className="hero-card">
          <div className="flex-between">
            <h1>{mode === "login" ? "Welcome back" : "Create a free account"}</h1>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Switch to Sign up" : "Switch to Log in"}
            </button>
          </div>
          <p className="muted">
            {mode === "login"
              ? "Sign in to continue your discovery workflow."
              : "Sign up and launch your first discovery run in minutes."}
          </p>
          <form className="panel" onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                required
                placeholder="you@glow.com"
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                required
                placeholder="At least 6 characters"
                minLength={6}
              />
            </div>
            {error && <div className="notice">{error}</div>}
            <div className="cta-row">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? "Working..." : mode === "login" ? "Log in" : "Sign up"}
              </button>
              <Link className="btn btn-secondary" href="/">
                Back to home
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
