import Badge from "@/components/badge";
import classNames from "classnames";

// Exact tag to color mapping (case-insensitive, use lowercase keys)
const tagColors: Record<string, string> = {
  temporal:
    "bg-blue-50 text-blue-800 ring-blue-600/20 dark:bg-blue-900 dark:text-blue-100 dark:ring-blue-400/30",
  synthetic:
    "bg-green-50 text-green-800 ring-green-600/20 dark:bg-green-900 dark:text-green-100 dark:ring-green-400/30",
  biological:
    "bg-pink-50 text-pink-800 ring-pink-600/20 dark:bg-pink-900 dark:text-pink-100 dark:ring-pink-400/30",
  social:
    "bg-purple-50 text-purple-800 ring-purple-600/20 dark:bg-purple-900 dark:text-purple-100 dark:ring-purple-400/30",
};

// Prefix-based label families (e.g., "source: benson", "lifting: clique complex")
const labelColors: Record<string, string> = {
  source:
    "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-900 dark:text-amber-100 dark:ring-amber-400/30",
  lifting:
    "bg-teal-50 text-teal-800 ring-teal-600/20 dark:bg-teal-900 dark:text-teal-100 dark:ring-teal-400/30",
};

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
    "bg-gray-50 text-gray-800 ring-gray-600/20 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-400/30";

  return (
    <Badge
      href={href}
      onClick={onClick}
      className={classNames(color, className)}
      color="none"
    >
      {name}
    </Badge>
  );
}
