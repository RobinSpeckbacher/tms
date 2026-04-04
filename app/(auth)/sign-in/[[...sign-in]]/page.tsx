"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

type Stage = "login" | "mfa";

export default function SignInPage() {
  const { signIn, fetchStatus } = useSignIn();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [error, setError] = useState("");

  const loading = fetchStatus === "fetching" || !isLoaded;

  async function finalize() {
    const { error } = await signIn.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session?.currentTask) return;
        const url = decorateUrl("/dashboard");
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.push(url);
        }
      },
    });
    if (error) setError(error.longMessage ?? error.message);
  }

  async function handleLogin(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setError("");

    if (isSignedIn) {
      router.replace("/dashboard");
      return;
    }

    if (!signIn) return;

    const { error: e1 } = await signIn.password({
      emailAddress: email,
      password,
    });
    if (e1) {
      setError(e1.longMessage ?? e1.message);
      return;
    }

    if (signIn.status === "complete") {
      await finalize();
    } else if (signIn.status === "needs_second_factor") {
      // Send MFA email code then show verification input
      const { error: e2 } = await signIn.mfa.sendEmailCode();
      if (e2) {
        setError(e2.longMessage ?? e2.message);
        return;
      }
      setStage("mfa");
    } else {
      setError(`Unexpected sign-in status: "${signIn.status}"`);
    }
  }

  async function handleMfa(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setError("");

    if (!signIn) return;

    const { error: e1 } = await signIn.mfa.verifyEmailCode({ code: mfaCode });
    if (e1) {
      setError(e1.longMessage ?? e1.message);
      return;
    }

    if (signIn.status === "complete") {
      await finalize();
    } else {
      setError(`Unexpected sign-in status: "${signIn.status}"`);
    }
  }

  /* ── MFA stage ────────────────────────────────────────────────── */
  if (stage === "mfa") {
    return (
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0f172b]">
            Check your email
          </h1>
          <p className="text-sm text-[#57688e] mt-1">
            We sent a verification code to{" "}
            <span className="font-medium text-[#0f172b]">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleMfa} className="space-y-5">
          <div>
            <label className="block text-[10px] font-semibold text-[#57688e] uppercase tracking-widest mb-1.5">
              Verification Code
            </label>
            <input
              type="text"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="000000"
              required
              maxLength={6}
              className="w-full px-4 py-2.5 border border-[#d5dbe8] rounded-lg text-sm text-center tracking-[0.5em] font-mono text-[#0f172b] placeholder:text-[#d5dbe8] placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-[#155dfc]/20 focus:border-[#155dfc] transition"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#155dfc] hover:bg-[#1147cc] text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Verifying…"
            ) : (
              <>
                Verify & Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#57688e] mt-6">
          Wrong account?{" "}
          <button
            onClick={() => {
              setStage("login");
              setError("");
              setMfaCode("");
            }}
            className="text-[#155dfc] font-medium hover:underline"
          >
            Go back
          </button>
        </p>
      </div>
    );
  }

  /* ── Login stage ──────────────────────────────────────────────── */
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172b]">Welcome back</h1>
        <p className="text-sm text-[#57688e] mt-1">
          Access your transport management dashboard.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-[10px] font-semibold text-[#57688e] uppercase tracking-widest mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d5dbe8]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-[#d5dbe8] rounded-lg text-sm text-[#0f172b] placeholder:text-[#d5dbe8] focus:outline-none focus:ring-2 focus:ring-[#155dfc]/20 focus:border-[#155dfc] transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[10px] font-semibold text-[#57688e] uppercase tracking-widest">
              Password
            </label>
            <Link href="#" className="text-xs text-[#155dfc] hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d5dbe8]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-10 py-2.5 border border-[#d5dbe8] rounded-lg text-sm text-[#0f172b] placeholder:text-[#d5dbe8] focus:outline-none focus:ring-2 focus:ring-[#155dfc]/20 focus:border-[#155dfc] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d5dbe8] hover:text-[#57688e] transition"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-[#d5dbe8] accent-[#155dfc]"
          />
          <span className="text-sm text-[#57688e]">
            Remember this device for 30 days
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#155dfc] hover:bg-[#1147cc] text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            "Signing in…"
          ) : (
            <>
              Login to Dashboard <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-[#57688e] mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-[#155dfc] font-medium hover:underline"
        >
          Create an account
        </Link>
      </p>

      <div className="mt-10 flex justify-between text-[10px] text-[#d5dbe8] uppercase tracking-widest">
        <span>Help</span>
        <span>Privacy</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          System Operational
        </span>
      </div>
    </div>
  );
}
