import React from "react";
import classNames from "classnames";

type ButtonOwnProps = {
  variant?: "primary" | "secondary" | "danger" | "text";
  className?: string;
  children: React.ReactNode;
};

export type ButtonProps<C extends React.ElementType = "button"> =
  ButtonOwnProps & {
    as?: C;
  } & Omit<React.ComponentPropsWithoutRef<C>, keyof ButtonOwnProps | "as">;

const variantStyles: Record<string, string> = {
  primary: "bg-primary text-white shadow-[0_12px_30px_rgb(35_93_156_/_0.22)]",
  secondary:
    "border border-[color:var(--color-border)] bg-white/80 text-slate-900 shadow-sm hover:bg-white dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400",
  text: "text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white",
};

const Button = <C extends React.ElementType = "button">({
  variant = "primary",
  className = "",
  as,
  children,
  ...props
}: ButtonProps<C>) => {
  const Component = (as ?? "button") as React.ElementType;

  return (
    <Component
      className={classNames(
        "inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
