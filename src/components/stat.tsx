import StatisticsBlock from "@/components/statistics-block";

export default function Stat({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <StatisticsBlock title={title}>
      <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-gray-100">
        {value}
      </p>
    </StatisticsBlock>
  );
}
