import Badge from "@/components/badge";
import { getTagSemanticGroup, type TagSemanticGroup } from "@/utils/tags";
import classNames from "classnames";

const groupColors: Record<TagSemanticGroup, string> = {
  domain:
    "bg-magenta-10 text-violet-100 ring-magenta-100/25 dark:bg-magenta-100/16 dark:text-magenta-25 dark:ring-magenta-50/25",
  "network-type":
    "bg-blue-10 text-blue-100 ring-blue-100/25 dark:bg-blue-100/18 dark:text-blue-25 dark:ring-blue-50/25",
  source:
    "bg-yellow-10 text-black-100 ring-yellow-100/55 dark:bg-yellow-100/20 dark:text-yellow-25 dark:ring-yellow-75/35",
  metadata:
    "bg-violet-10 text-violet-100 ring-violet-100/25 dark:bg-violet-100/18 dark:text-violet-25 dark:ring-violet-50/25",
  lifting:
    "bg-green-10 text-green-100 ring-green-100/30 dark:bg-green-100/18 dark:text-green-25 dark:ring-green-50/25",
  other:
    "bg-white text-black-75 ring-black-25/80 dark:bg-black-100 dark:text-black-25 dark:ring-black-75/80",
};

const baseClasses =
  "max-w-full gap-1.5 whitespace-normal text-left break-words ring-1 ring-inset";

export default function Tag({
  name,
  displayName,
  href,
  className = "",
  onClick,
  interactive,
  selected = false,
}: {
  name: string;
  displayName?: string;
  href?: string;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
  selected?: boolean;
}) {
  const isInteractive = interactive ?? Boolean(href || onClick);
  const color = groupColors[getTagSemanticGroup(name)];
  const label = displayName ?? name;

  return (
    <Badge
      href={href}
      onClick={onClick}
      className={classNames(
        baseClasses,
        color,
        isInteractive &&
          "cursor-pointer hover:ring-2 focus-visible:ring-2 focus-visible:ring-blue-100/45 focus-visible:outline-none active:brightness-[0.96]",
        selected &&
          "ring-2 ring-blue-100/55 brightness-[0.97] dark:ring-blue-50/55",
        className,
      )}
      color="none"
    >
      <span className="min-w-0 wrap-break-word">{label}</span>
    </Badge>
  );
}
