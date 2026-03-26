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
  note: "border-l-blue-500 bg-blue-50/50 text-gray-800 dark:border-l-blue-400 dark:bg-blue-950/20 dark:text-gray-100",
  tip: "border-l-green-500 bg-green-50/50 text-gray-800 dark:border-l-green-400 dark:bg-green-950/20 dark:text-gray-100",
  important:
    "border-l-purple-500 bg-purple-50/50 text-gray-800 dark:border-l-purple-400 dark:bg-purple-950/20 dark:text-gray-100",
  warning:
    "border-l-yellow-500 bg-yellow-50/50 text-gray-800 dark:border-l-yellow-400 dark:bg-yellow-950/20 dark:text-gray-100",
  caution:
    "border-l-red-500 bg-red-50/50 text-gray-800 dark:border-l-red-400 dark:bg-red-950/20 dark:text-gray-100",
};

const headlineStyles = {
  note: "text-blue-700 dark:text-blue-300",
  tip: "text-green-700 dark:text-green-300",
  important: "text-purple-700 dark:text-purple-300",
  warning: "text-yellow-700 dark:text-yellow-300",
  caution: "text-red-700 dark:text-red-300",
};

const icons = {
  note: (
    <FontAwesomeIcon
      icon={faInfoCircle}
      className="size-4 shrink-0 text-blue-600 dark:text-blue-300"
    />
  ),
  tip: (
    <FontAwesomeIcon
      icon={faCheckCircle}
      className="size-4 shrink-0 text-green-600 dark:text-green-300"
    />
  ),
  important: (
    <FontAwesomeIcon
      icon={faExclamationTriangle}
      className="size-4 shrink-0 text-purple-600 dark:text-purple-300"
    />
  ),
  warning: (
    <FontAwesomeIcon
      icon={faExclamationTriangle}
      className="size-4 shrink-0 text-yellow-600 dark:text-yellow-300"
    />
  ),
  caution: (
    <FontAwesomeIcon
      icon={faTimesCircle}
      className="size-4 shrink-0 text-red-600 dark:text-red-300"
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
        "mb-4 rounded-md border border-l-4 border-gray-200 px-4 py-4 dark:border-gray-800",
        styles[type],
        className,
      )}
      role="alert"
    >
      <div
        className={classnames(
          "flex items-center gap-2 font-semibold",
          headlineStyles[type],
        )}
      >
        {icons[type]}
        <span>{headline ?? defaultHeadlines[type]}</span>
      </div>
      <div className="mt-2 text-gray-700 dark:text-gray-300 [&_ol]:my-0 [&_ol]:pl-6 [&_p]:my-0 [&_p+p]:mt-3 [&_ul]:my-0 [&_ul]:pl-6">
        {children}
      </div>
    </div>
  );
}
