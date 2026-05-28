import classNames from "classnames";

export default function StatisticsBlock({
  title,
  className = "",
  bodyClassName = "",
  children,
}: {
  title?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={classNames(
        "rounded-lg bg-slate-50/80 p-4 dark:bg-slate-900/65",
        className,
      )}
    >
      {title && (
        <h3 className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
          {title}
        </h3>
      )}
      <div className={classNames(title && "mt-4", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
