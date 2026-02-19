import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "outlined" | "glass";
  rounded?: "default" | "lg";
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  padding = "md",
  variant = "default",
  rounded = "default",
  hover = false,
}: CardProps) {
  const baseClasses =
    "bg-white border transition-all duration-300 ease-out animate-fade-in";

  const roundedClasses = {
    default: "rounded-[2.5rem]",
    lg: "rounded-2xl",
  };

  const variantClasses = {
    default:
      "border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgb(0,0,0,0.10)] hover:-translate-y-1",
    elevated:
      "border-transparent shadow-2xl shadow-slate-200/80 hover:shadow-[0_32px_64px_rgb(0,0,0,0.14)] hover:-translate-y-1.5",
    outlined:
      "border-slate-200 shadow-none ring-1 ring-inset ring-slate-100 hover:border-slate-300 hover:bg-slate-50/40",
    glass:
      "bg-white/80 backdrop-blur-md border-white/20 shadow-[0_8px_32px_rgb(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgb(0,0,0,0.10)] hover:-translate-y-1",
  };

  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverScaleClass = hover ? "hover:scale-[1.01]" : "";

  return (
    <>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out both;
        }
      `}</style>
      <div
        className={`${baseClasses} ${roundedClasses[rounded]} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverScaleClass} ${className}`}
      >
        {children}
      </div>
    </>
  );
}