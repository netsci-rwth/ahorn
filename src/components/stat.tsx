import StatisticsBlock from "@/components/statistics-block";

export default function Stat({
  title,
  value,
  description,
  className = "",
}: {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
}) {
  return (
    <StatisticsBlock title={title} className={className}>
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
