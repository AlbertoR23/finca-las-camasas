import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: "default" | "small" | "large" | "underlined";
  showValidState?: boolean; // Mostrar estado válido cuando no hay error y hay valor
}

export function Input({
  label,
  error,
  icon,
  className = "",
  id,
  variant = "default",
  showValidState = false,
  disabled,
  required,
  ...props
}: InputProps) {
  const inputId = id || `input-${crypto.randomUUID?.() || Date.now().toString(36)}`;
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

  // Clases base comunes para todos los inputs
  const baseClasses =
    "w-full bg-white text-slate-800 font-bold placeholder:text-slate-400 placeholder:italic outline-none transition-all duration-300 ease-in-out";

  // Estados visuales: Normal, Focus, Error, Disabled, Valid
  const stateClasses = disabled
    ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
    : error
    ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 animate-shake"
    : showValidState && hasValue && !error
    ? "border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
    : "border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 hover:border-slate-300";

  // Efecto de escala suave en focus
  const focusScaleClasses = isFocused && !disabled ? "scale-[1.01]" : "";

  // Variantes de tamaño y estilo
  const variantClasses = {
    default: "h-14 px-4 py-4 rounded-2xl border shadow-sm", // 56px altura
    small: "h-10 px-3 py-2 rounded-xl border shadow-sm text-sm", // 40px altura
    large: "h-16 px-5 py-5 rounded-2xl border shadow-md text-lg", // 64px altura
    underlined: "h-12 px-2 py-3 border-0 border-b-2 rounded-none shadow-none bg-transparent", // Solo borde inferior
  }[variant];

  // Padding adicional cuando hay icono
  const iconPaddingClasses = icon
    ? variant === "small"
      ? "pl-10"
      : variant === "large"
      ? "pl-14"
      : "pl-12"
    : "";

  // Clases del icono según variante
  const iconSizeClasses = {
    default: "w-5 h-5 left-4",
    small: "w-4 h-4 left-3",
    large: "w-6 h-6 left-5",
    underlined: "w-5 h-5 left-2",
  }[variant];

  // Color del icono según estado
  const iconColorClasses = disabled
    ? "text-slate-300"
    : error
    ? "text-rose-400"
    : isFocused
    ? "text-green-500"
    : "text-slate-400";

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  return (
    <div className="space-y-1">
      {/* Label mejorado */}
      {label && (
        <label
          htmlFor={inputId}
          className={`
            block text-xs font-bold text-slate-500 ml-2 transition-colors duration-200
            ${required ? "after:content-['*'] after:ml-0.5 after:text-rose-500" : ""}
            ${isFocused ? "text-green-600" : ""}
            ${error ? "text-rose-500" : ""}
          `}
        >
          {label}
        </label>
      )}

      {/* Contenedor del input con icono */}
      <div className="relative">
        {/* Icono con animación */}
        {icon && (
          <span
            className={`
              absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out
              ${iconSizeClasses} ${iconColorClasses}
              ${isFocused && !disabled ? "scale-110" : ""}
            `}
          >
            {icon}
          </span>
        )}

        {/* Input principal */}
        <input
          id={inputId}
          disabled={disabled}
          required={required}
          className={`
            ${baseClasses}
            ${variantClasses}
            ${stateClasses}
            ${iconPaddingClasses}
            ${focusScaleClasses}
            ${className}
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>

      {/* Mensaje de error con animación */}
      {error && (
        <div
          id={`${inputId}-error`}
          className="flex items-center gap-1.5 ml-2 animate-fade-in"
          role="alert"
        >
          <span className="text-rose-500 text-xs" aria-hidden="true">
            ⚠️
          </span>
          <p className="text-xs font-bold text-rose-500">{error}</p>
        </div>
      )}
    </div>
  );
}