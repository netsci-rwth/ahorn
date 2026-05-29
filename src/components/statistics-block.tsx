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
        "rounded-xl bg-blue-10/70 p-4 ring-1 ring-blue-25/70 transition dark:bg-blue-100/15 dark:ring-blue-75/25",
        className,
      )}
    >
      {title && (
        <h3 className="text-xs font-semibold tracking-wide text-black-75 uppercase dark:text-black-25">
          {title}
        </h3>
      )}
      <div className={classNames(title && "mt-4", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
