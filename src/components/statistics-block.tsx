import classNames from "classnames";
import Surface, { type SurfaceVariant } from "@/components/surface";

export default function StatisticsBlock({
  title,
  variant = "secondary",
  className = "",
  bodyClassName = "",
  children,
}: {
  title?: string;
  variant?: SurfaceVariant;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Surface
      as="section"
      variant={variant}
      className={classNames("p-4", className)}
    >
      {title && (
        <h3 className="text-xs font-semibold tracking-wide text-black-75 uppercase dark:text-black-25">
          {title}
        </h3>
      )}
      <div className={classNames(title && "mt-4", bodyClassName)}>
        {children}
      </div>
    </Surface>
  );
}
