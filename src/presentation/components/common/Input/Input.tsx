import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;

  const baseClasses =
    "w-full p-4 rounded-2xl bg-white border text-slate-800 font-bold placeholder:text-slate-400 outline-none transition-all shadow-sm";

  const stateClasses = error
    ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
    : "border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-100";

  const iconClasses = icon ? "pl-12" : "";

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[9px] font-black text-slate-400 ml-2 uppercase"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`${baseClasses} ${stateClasses} ${iconClasses} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] font-bold text-rose-500 ml-2">{error}</p>
      )}
    </div>
  );
}
