import React from "react";
import classNames from "classnames";

export type ButtonProps = {
  variant?: "primary" | "secondary" | "danger" | "text";
  className?: string;
  as?: React.ElementType;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<"button">;

const variantStyles: Record<string, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark shadow-sm",
  secondary:
    "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  text: "text-gray-900",
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  as: Component = "button",
  children,
  ...props
}) => (
  <Component
    className={classNames(
      "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
      variantStyles[variant],
      className,
    )}
    {...props}
  >
    {children}
  </Component>
);

export default Button;
