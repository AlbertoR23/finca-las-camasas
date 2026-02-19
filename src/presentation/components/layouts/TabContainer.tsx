import React, { useEffect, useRef, useState } from "react";

interface TabContainerProps {
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function TabContainer({
  activeTab,
  children,
  className = "",
}: TabContainerProps) {
  return (
    <div
      className={`space-y-6 animate-in slide-in-from-right-4 duration-500 ${className}`}
      role="tabpanel"
      aria-live="polite"
      aria-atomic="true"
    >
      {children}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  direction?: "forward" | "backward" | "neutral";
  animationType?: "slide" | "fade" | "scale";
  duration?: number;
}

export function TabPanel({
  id,
  activeTab,
  children,
  direction = "forward",
  animationType = "slide",
  duration = 700,
}: TabPanelProps) {
  const [shouldRender, setShouldRender] = useState(activeTab === id);
  const [isVisible, setIsVisible] = useState(false);
  const previousActiveTab = useRef(activeTab);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Detectar si la tab se está activando
    if (activeTab === id && !shouldRender) {
      setShouldRender(true);
      // Pequeño delay para que el DOM se actualice antes de animar
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }

    // Detectar si la tab se está desactivando
    if (activeTab !== id && shouldRender) {
      setIsVisible(false);
      // Esperar a que termine la animación antes de desmontar
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }

    previousActiveTab.current = activeTab;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeTab, id, shouldRender, duration]);

  // No renderizar si no es la tab activa y no está en transición
  if (!shouldRender) return null;

  // Determinar clases de animación basadas en el tipo y dirección
  const getAnimationClasses = () => {
    const baseClasses = "transition-all ease-[cubic-bezier(0.4,0,0.2,1)]";
    const durationClass = `duration-[${duration}ms]`;

    if (!isVisible) {
      // Animación de salida
      return `${baseClasses} ${durationClass} opacity-0 ${getExitAnimation()}`;
    }

    // Animación de entrada
    switch (animationType) {
      case "slide":
        return `${baseClasses} ${durationClass} animate-in ${getSlideAnimation()} fade-in`;
      case "fade":
        return `${baseClasses} ${durationClass} animate-in fade-in`;
      case "scale":
        return `${baseClasses} ${durationClass} animate-in fade-in zoom-in-95`;
      default:
        return `${baseClasses} ${durationClass} animate-in slide-in-from-bottom-4 fade-in`;
    }
  };

  const getSlideAnimation = () => {
    switch (direction) {
      case "forward":
        return "slide-in-from-right-4";
      case "backward":
        return "slide-in-from-left-4";
      case "neutral":
        return "slide-in-from-bottom-2";
      default:
        return "slide-in-from-right-4";
    }
  };

  const getExitAnimation = () => {
    switch (animationType) {
      case "slide":
        switch (direction) {
          case "forward":
            return "translate-x-4";
          case "backward":
            return "-translate-x-4";
          default:
            return "translate-y-2";
        }
      case "scale":
        return "scale-95";
      default:
        return "";
    }
  };

  return (
    <div
      className={getAnimationClasses()}
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
    >
      {children}
    </div>
  );
}

// Componente helper para lazy loading
interface LazyTabPanelProps extends TabPanelProps {
  lazy?: boolean;
}

export const LazyTabPanel = React.memo(function LazyTabPanel({
  lazy = false,
  ...props
}: LazyTabPanelProps) {
  const [hasBeenActive, setHasBeenActive] = useState(!lazy);

  useEffect(() => {
    if (props.activeTab === props.id && !hasBeenActive) {
      setHasBeenActive(true);
    }
  }, [props.activeTab, props.id, hasBeenActive]);

  if (!hasBeenActive) return null;

  return <TabPanel {...props} />;
});
