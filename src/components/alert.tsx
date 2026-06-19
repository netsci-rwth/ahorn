import React from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

export type AlertProps = {
  type?: "note" | "tip" | "important" | "warning" | "caution";
  headline?: string;
  children: React.ReactNode;
  className?: string;
};

const styles = {
  note: "border-l-blue-100 bg-blue-10/55 dark:border-l-blue-50 dark:bg-blue-100/10",
  tip: "border-l-green-100 bg-green-10/70 dark:border-l-green-50 dark:bg-green-100/10",
  important:
    "border-l-purple-100 bg-purple-10/70 dark:border-l-purple-50 dark:bg-purple-100/10",
  warning:
    "border-l-orange-100 bg-orange-10/80 dark:border-l-orange-50 dark:bg-orange-100/10",
  caution:
    "border-l-red-100 bg-red-10/70 dark:border-l-red-50 dark:bg-red-100/10",
};

const headlineStyles = {
  note: "text-blue-100 dark:text-blue-50",
  tip: "text-green-100 dark:text-green-50",
  important: "text-purple-100 dark:text-purple-50",
  warning: "text-orange-100 dark:text-orange-50",
  caution: "text-red-100 dark:text-red-50",
};

const icons = {
  note: (
    <FontAwesomeIcon
      icon={faInfoCircle}
      className="size-3.5 shrink-0 text-blue-100 dark:text-blue-50"
    />
  ),
  tip: (
    <FontAwesomeIcon
      icon={faCheckCircle}
      className="size-3.5 shrink-0 text-green-100 dark:text-green-50"
    />
  ),
  important: (
    <FontAwesomeIcon
      icon={faExclamationTriangle}
      className="size-3.5 shrink-0 text-purple-100 dark:text-purple-50"
    />
  ),
  warning: (
    <FontAwesomeIcon
      icon={faExclamationTriangle}
      className="size-3.5 shrink-0 text-orange-100 dark:text-orange-50"
    />
  ),
  caution: (
    <FontAwesomeIcon
      icon={faTimesCircle}
      className="size-3.5 shrink-0 text-red-100 dark:text-red-50"
    />
  ),
};

const defaultHeadlines = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
};

/**
 * Renders an alert box with a specified type, icon, and content.
 *
 * @param type - The type of alert to display, which determines the icon and styling.
 * @param headline - Optional headline shown above the alert content. Defaults to the variant name.
 * @param children - The content to display inside the alert.
 * @param className - Additional CSS classes to apply to the alert container.
 * @returns The rendered alert component.
 *
 * @example
 * ```tsx
 * <Alert type="tip">Operation completed successfully!</Alert>
 * ```
 */
export default function Alert({
  type = "note",
  headline,
  children,
  className = "",
}: AlertProps) {
  return (
    <div
      className={classnames(
        "my-5 rounded-md border border-l-4 border-black-10 px-4 py-3 text-black-100 dark:border-black-75/45 dark:text-white",
        styles[type],
        className,
      )}
      role="alert"
    >
      <div
        className={classnames(
          "flex items-center gap-2 text-sm font-semibold",
          headlineStyles[type],
        )}
      >
        {icons[type]}
        <span>{headline ?? defaultHeadlines[type]}</span>
      </div>
      <div className="mt-2 text-sm leading-6 text-black-75 dark:text-black-25 [&_ol]:my-0 [&_ol]:pl-5 [&_p]:my-0 [&_p+p]:mt-3 [&_ul]:my-0 [&_ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
