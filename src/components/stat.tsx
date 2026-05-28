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
      <p className="text-2xl leading-tight font-semibold tracking-tight wrap-break-word text-slate-950 dark:text-slate-50">
        {value}
      </p>
    </StatisticsBlock>
  );
}
