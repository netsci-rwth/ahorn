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
      className={classNames("border-l-2 border-slate-200 pl-4", className)}
    >
      {title && (
        <h3 className="truncate text-sm font-medium tracking-wide text-slate-500 uppercase">
          {title}
        </h3>
      )}
      <div className={classNames(title && "mt-4", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
