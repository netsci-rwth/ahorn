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
    "bg-yellow-50/90 text-yellow-100 ring-yellow-100/20 dark:bg-yellow-100/50 dark:text-yellow-100 dark:ring-yellow-75/25",
  info: "bg-blue-100/10 text-blue-100 ring-blue-100/15 dark:bg-blue-100/18 dark:text-blue-25 dark:ring-blue-50/20",
  warning:
    "bg-orange-50/90 text-orange-100 ring-orange-100/20 dark:bg-orange-100/50 dark:text-orange-100 dark:ring-orange-75/25",
  success:
    "bg-green-10 text-green-100 ring-green-100/20 dark:bg-green-100/50 dark:text-green-100 dark:ring-green-75/25",
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
    "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset transition-colors duration-150",
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
