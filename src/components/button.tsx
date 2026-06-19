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
  primary:
    "bg-blue-100 text-white shadow-[0_10px_24px_rgb(35_93_156_/_0.18)] hover:bg-blue-75",
  secondary:
    "border border-black-25 bg-white/80 text-black-100 shadow-sm hover:border-blue-25 hover:bg-white hover:text-blue-100 dark:border-black-75 dark:bg-black-100/80 dark:text-white dark:hover:border-blue-75/55 dark:hover:bg-black-100 dark:hover:text-blue-50",
  danger:
    "bg-red-100 text-white shadow-sm hover:bg-red-100 dark:bg-red-100 dark:hover:bg-red-75",
  text: "text-black-75 hover:text-black-100 dark:text-black-25 dark:hover:text-white",
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
        "inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-blue-100/30 focus-visible:outline-none",
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
