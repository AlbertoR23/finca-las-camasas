import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "relative inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-px focus:outline-none";

  const variantClasses = {
    primary:
      "bg-[#1B4332] text-white shadow-md shadow-green-900/25 hover:bg-[#2D6A4F] hover:shadow-lg hover:shadow-green-900/30 focus:ring-4 focus:ring-[#1B4332]/30",
    secondary:
      "bg-slate-100 text-slate-700 shadow-sm shadow-slate-900/10 hover:bg-slate-200 hover:shadow-md hover:shadow-slate-900/15 focus:ring-4 focus:ring-slate-400/30",
    danger:
      "bg-rose-600 text-white shadow-md shadow-rose-900/25 hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-900/30 focus:ring-4 focus:ring-rose-500/30",
    success:
      "bg-emerald-600 text-white shadow-md shadow-emerald-900/25 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-900/30 focus:ring-4 focus:ring-emerald-500/30",
  };

  const sizeClasses = {
    sm: "h-10 px-4 text-xs gap-2",
    md: "h-12 px-6 text-sm gap-2",
    lg: "h-14 px-8 text-base gap-2.5",
  };

  const spinnerSizes = {
    sm: "w-3.5 h-3.5 border-[1.5px]",
    md: "w-4 h-4 border-2",
    lg: "w-5 h-5 border-2",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <span
          className={`${spinnerSizes[size]} rounded-full border-current border-t-transparent animate-spin opacity-80`}
          aria-hidden="true"
        />
      )}
      <span className={loading ? "opacity-80" : ""}>{children}</span>
    </button>
  );
}