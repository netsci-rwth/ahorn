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
  default: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
  info: "bg-primary/10 text-primary ring-primary/30",
  warning: "bg-orange-50 text-orange-800 ring-orange-600/20",
  success: "bg-green-50 text-green-800 ring-green-600/20",
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
    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
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
