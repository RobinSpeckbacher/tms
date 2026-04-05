"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Building2 } from "lucide-react";

type Stage = "register" | "verify";

export default function SignUpPage() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("register");

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const loading = fetchStatus === "fetching";

  async function handleRegister(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setError("");

    const [firstName, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ");

    // Step 1: create sign-up with email
    const { error: e1 } = await signUp.create({ emailAddress: email });
    if (e1) {
      setError(e1.longMessage ?? e1.message);
      return;
    }

    // Step 2: set password + name fields
    const { error: e2 } = await signUp.password({
      password,
      emailAddress: email,
      firstName: firstName || "",
      lastName: lastName || "",
      unsafeMetadata: { company },
    });
    if (e2) {
      setError(e2.longMessage ?? e2.message);
      return;
    }

    // Step 3: send email verification code
    const { error: e3 } = await signUp.verifications.sendEmailCode();
    if (e3) {
      setError(e3.longMessage ?? e3.message);
      return;
    }

    setStage("verify");
  }

  async function handleVerify(e: React.BaseSyntheticEvent) {
    e.preventDefault();
    setError("");

    // Step 4: verify email code
    const { error: e1 } = await signUp.verifications.verifyEmailCode({ code });
    if (e1) {
      setError(e1.longMessage ?? e1.message);
      return;
    }

    // Step 5: finalize (activates session)
    const { error: e2 } = await signUp.finalize({
      navigate: ({ session, decorateUrl }) => {
        if (session.currentTask) return;
        const url = decorateUrl("/dashboard");
        if (url.startsWith("http")) {
          window.location.href = url;
        } else {
          router.push(url);
        }
      },
    });
    if (e2) {
      setError(e2.longMessage ?? e2.message);
    }
  }

  /* ── Verification stage ───────────────────────────────────────── */
  if (stage === "verify") {
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

        <form
          onSubmit={(e) => {
            void handleVerify(e);
          }}
          className="space-y-5"
        >
          <div>
            <label className="block text-[10px] font-semibold text-[#57688e] uppercase tracking-widest mb-1.5">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
            className="w-full bg-[#155dfc] hover:bg-[#1147cc] text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying…" : "Verify Email"}
          </button>
        </form>

        <p className="text-center text-sm text-[#57688e] mt-6">
          Wrong email?{" "}
          <button
            onClick={() => setStage("register")}
            className="text-[#155dfc] font-medium hover:underline"
          >
            Go back
          </button>
        </p>
      </div>
    );
  }

  /* ── Register stage ───────────────────────────────────────────── */
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172b]">Get Started</h1>
        <p className="text-sm text-[#57688e] mt-1">
          Initialize your professional operator profile.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          void handleRegister(e);
        }}
        className="space-y-4"
      >
        {/* Full Name */}
        <div>
          <label className="block text-[10px] font-semibold text-[#57688e] uppercase tracking-widest mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d5dbe8]" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="E.g. Marcus Vane"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-[#d5dbe8] rounded-lg text-sm text-[#0f172b] placeholder:text-[#d5dbe8] focus:outline-none focus:ring-2 focus:ring-[#155dfc]/20 focus:border-[#155dfc] transition"
            />
          </div>
        </div>

        {/* Company */}
        <div>
          <label className="block text-[10px] font-semibold text-[#57688e] uppercase tracking-widest mb-1.5">
            Company Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d5dbe8]" />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Vane Logistics Ltd."
              required
              className="w-full pl-10 pr-4 py-2.5 border border-[#d5dbe8] rounded-lg text-sm text-[#0f172b] placeholder:text-[#d5dbe8] focus:outline-none focus:ring-2 focus:ring-[#155dfc]/20 focus:border-[#155dfc] transition"
            />
          </div>
        </div>

        {/* Work Email */}
        <div>
          <label className="block text-[10px] font-semibold text-[#57688e] uppercase tracking-widest mb-1.5">
            Work Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d5dbe8]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="m.vane@fleetstream.pro"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-[#d5dbe8] rounded-lg text-sm text-[#0f172b] placeholder:text-[#d5dbe8] focus:outline-none focus:ring-2 focus:ring-[#155dfc]/20 focus:border-[#155dfc] transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[10px] font-semibold text-[#57688e] uppercase tracking-widest mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d5dbe8]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
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

        {/* Terms */}
        <p className="text-xs text-[#57688e] leading-relaxed">
          By clicking create account, you acknowledge that you have read and
          agree to our{" "}
          <Link href="#" className="text-[#155dfc] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-[#155dfc] hover:underline">
            Security Protocols
          </Link>
          .
        </p>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#155dfc] hover:bg-[#1147cc] text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-[#57688e] mt-6">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-[#155dfc] font-medium hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
