import { Truck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* ── Left branding panel ──────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] relative flex-col justify-between p-12 overflow-hidden bg-[#080f1e]">
        {/* Layered gradients for depth */}
        <div className="absolute inset-0 bg-linear-to-br from-[#0d1f3c] via-[#080f1e] to-[#040810]" />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#155dfc 1px, transparent 1px), linear-gradient(90deg, #155dfc 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Blue accent glow */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#155dfc] opacity-[0.06] blur-3xl" />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full bg-[#155dfc] opacity-[0.04] blur-3xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#155dfc] flex items-center justify-center shadow-lg">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">
            TMS Pro
          </span>
        </div>

        {/* Main copy */}
        <div className="relative z-10 space-y-5">
          <h1 className="text-5xl font-extrabold text-white leading-tight">
            The <span className="text-[#155dfc]">Precision</span>
            <br />
            Navigator.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Managing global logistics with the authority of a financial terminal
            and the agility of a startup. Your high-density data, unified.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-10">
          <div>
            <p className="text-3xl font-bold text-white tracking-tight">4.2M</p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Active Shipments
            </p>
          </div>
          <div className="border-l border-white/10 pl-10">
            <p className="text-3xl font-bold text-white tracking-tight">
              99.9%
            </p>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Route Precision
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="absolute bottom-6 left-12 right-12 text-[10px] text-slate-600 z-10">
          © 2026 TMS PRO. HIGH-DENSITY LOGISTICS SYSTEM.
        </p>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        {children}
      </div>
    </div>
  );
}
