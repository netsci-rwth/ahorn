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
        "not-prose border-b border-slate-200 pb-8",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-sm font-semibold tracking-widest text-primary uppercase">
          {eyebrow}
        </p>
      )}
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {description && (
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      )}
      {children}
    </section>
  );
}
