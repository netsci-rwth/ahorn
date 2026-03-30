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
  default:
    "bg-amber-50/90 text-amber-900 ring-amber-600/20 dark:bg-amber-950/50 dark:text-amber-100 dark:ring-amber-400/25",
  info: "bg-primary/10 text-primary ring-primary/15 dark:bg-primary/18 dark:text-sky-200 dark:ring-sky-300/20",
  warning:
    "bg-orange-50/90 text-orange-900 ring-orange-600/20 dark:bg-orange-950/50 dark:text-orange-100 dark:ring-orange-400/25",
  success:
    "bg-emerald-50/90 text-emerald-900 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-100 dark:ring-emerald-400/25",
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
