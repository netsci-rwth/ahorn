export default function Stat({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 dark:bg-gray-900">
      <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
        {value}
      </dd>
    </div>
  );
}
