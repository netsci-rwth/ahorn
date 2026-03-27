import Link from "next/link";
import React from "react";
import classNames from "classnames";

interface BadgeProps {
  href?: string;
  className?: string;
  color?: "default" | "primary" | "warning" | "success" | "info" | "none";
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const schemeClasses: Record<string, string> = {
  default: "bg-amber-50/90 text-amber-900 ring-amber-600/20",
  info: "bg-primary/10 text-primary ring-primary/15",
  warning: "bg-orange-50/90 text-orange-900 ring-orange-600/20",
  success: "bg-emerald-50/90 text-emerald-900 ring-emerald-600/20",
  none: "",
};

const Badge = ({
  href,
  className = "",
  color = "default",
  children,
  onClick,
}: BadgeProps) => {
  const computedColor = schemeClasses[color];
  const badgeClass = classNames(
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-colors duration-150",
    computedColor,
    className,
  );

  if (!href) {
    if (onClick) {
      return (
        <button type="button" onClick={onClick} className={badgeClass}>
          {children}
        </button>
      );
    }
    return <span className={badgeClass}>{children}</span>;
  }
  return (
    <Link href={href} className={badgeClass} onClick={onClick}>
      {children}
    </Link>
  );
};

export default Badge;
