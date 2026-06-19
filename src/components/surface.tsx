import classNames from "classnames";

export type SurfaceVariant = "primary" | "secondary";

const surfaceVariants: Record<SurfaceVariant, string> = {
  primary:
    "rounded-lg border border-black-25/80 bg-white shadow-[0_18px_55px_rgb(0_84_159_/_0.10)] dark:border-black-75/70 dark:bg-black-100/45 dark:shadow-none",
  secondary:
    "rounded-lg border border-black-25/80 bg-white dark:border-black-75/70 dark:bg-black-100/45",
};

const interactiveClasses =
  "transition hover:border-blue-50 hover:bg-white focus-visible:ring-2 focus-visible:ring-blue-100/30 focus-visible:outline-none dark:hover:border-blue-75/55 dark:hover:bg-black-100/85";

export function surfaceClassName({
  variant = "secondary",
  interactive = false,
  className = "",
}: {
  variant?: SurfaceVariant;
  interactive?: boolean;
  className?: string;
} = {}) {
  return classNames(
    surfaceVariants[variant],
    interactive && interactiveClasses,
    className,
  );
}

export default function Surface({
  as: Component = "div",
  variant = "secondary",
  interactive = false,
  className = "",
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  as?: React.ElementType;
  variant?: SurfaceVariant;
  interactive?: boolean;
}) {
  return (
    <Component
      className={surfaceClassName({ variant, interactive, className })}
      {...props}
    />
  );
}
