import Link from "next/link";
import React from "react";
import classNames from "classnames";

interface BadgeProps {
  href?: string;
  className?: string;
  color?: string;
  children?: React.ReactNode;
}

const defaultColor = "bg-yellow-50 text-yellow-800 ring-yellow-600/20";

const Badge = ({ href, className = "", color, children }: BadgeProps) => {
  const badgeClass = classNames(
    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
    color || defaultColor,
    className,
  );

  if (!href) {
    return <span className={badgeClass}>{children}</span>;
  }
  return (
    <Link href={href} className={badgeClass}>
      {children}
    </Link>
  );
};

export default Badge;
