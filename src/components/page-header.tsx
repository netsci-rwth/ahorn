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
        "not-prose border-b border-black-10 pb-8 dark:border-black-75/50",
        className,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-sm font-semibold tracking-widest text-blue-100 uppercase">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-3 text-4xl font-semibold tracking-tight wrap-break-word text-black-100 dark:text-white">
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
        <p className="mt-4 text-base leading-7 text-black-75 dark:text-black-25">
          {description}
        </p>
      )}
      {children}
    </section>
  );
}
