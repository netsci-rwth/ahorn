import Badge from "@/components/badge";
import classNames from "classnames";

// Exact tag to color mapping (case-insensitive, use lowercase keys)
const tagColors: Record<string, string> = {
  temporal:
    "bg-blue-10 text-black-100 ring-blue-100/35 dark:bg-blue-100/30 dark:text-white dark:ring-blue-75/50",
  synthetic:
    "bg-green-10 text-black-100 ring-green-100/35 dark:bg-green-100/30 dark:text-white dark:ring-green-75/50",
  biological:
    "bg-magenta-10 text-black-100 ring-magenta-100/35 dark:bg-magenta-100/30 dark:text-white dark:ring-magenta-75/50",
  social:
    "bg-purple-10 text-black-100 ring-purple-100/35 dark:bg-purple-100/30 dark:text-white dark:ring-purple-75/50",
};

// Prefix-based label families (e.g., "source: benson", "lifting: clique complex")
const labelColors: Record<string, string> = {
  source:
    "bg-yellow-10 text-black-100 ring-yellow-100/35 dark:bg-yellow-100/30 dark:text-black-100 dark:ring-yellow-75/50",
  lifting:
    "bg-turquoise-10 text-black-100 ring-turquoise-100/35 dark:bg-turquoise-100/30 dark:text-white dark:ring-turquoise-75/50",
  metadata:
    "bg-violet-10 text-black-100 ring-violet-100/35 dark:bg-violet-100/30 dark:text-white dark:ring-violet-75/50",
};

const baseClasses = "ring-1 ring-inset";

export default function Tag({
  name,
  href,
  className = "",
  onClick,
}: {
  name: string;
  href?: string;
  className?: string;
  onClick?: () => void;
}) {
  const normalized = name.trim().toLowerCase();
  const prefix = normalized.includes(":")
    ? normalized.split(":")[0].trim()
    : normalized;

  const color =
    tagColors[normalized] ??
    labelColors[prefix] ??
    "bg-white text-black-100 ring-black-25/70 dark:bg-black-100 dark:text-white dark:ring-black-75/70";

  return (
    <Badge
      href={href}
      onClick={onClick}
      className={classNames(
        "gap-1.5",
        "hover:brightness-[0.98]",
        baseClasses,
        color,
        className,
      )}
      color="none"
    >
      <span>{name}</span>
    </Badge>
  );
}
