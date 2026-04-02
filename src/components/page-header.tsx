import classNames from "classnames";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
  children,
}: PageHeaderProps) {
  return (
    <section
      className={classNames(
        "not-prose border-b border-slate-200 pb-8 dark:border-slate-700",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 wrap-break-word text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            {title}
          </h1>
        </div>
        {actions && (
          <div className="min-w-0 self-start lg:w-auto lg:max-w-[min(42vw,30rem)] lg:shrink-0 lg:self-center">
            {actions}
          </div>
        )}
      </div>
      {description && (
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      )}
      {children}
    </section>
  );
}
