import StatisticsBlock from "@/components/statistics-block";
import type { SurfaceVariant } from "@/components/surface";

export default function Stat({
  title,
  value,
  description,
  variant = "primary",
  className = "",
}: {
  title: string;
  value: string | number;
  description?: string;
  variant?: SurfaceVariant;
  className?: string;
}) {
  return (
    <StatisticsBlock title={title} variant={variant} className={className}>
      <p className="text-2xl leading-tight font-semibold tracking-tight wrap-break-word text-black-100 dark:text-white">
        {value}
      </p>
      {description && (
        <p className="mt-2 text-sm leading-6 text-black-75 dark:text-black-25">
          {description}
        </p>
      )}
    </StatisticsBlock>
  );
}
