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
  type?: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
  className?: string;
};

const styles = {
  info: "bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700",
  success:
    "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700",
  warning:
    "bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700",
  error:
    "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-700",
};

const icons = {
  info: (
    <FontAwesomeIcon
      icon={faInfoCircle}
      className="size-5 shrink-0 text-blue-400 dark:text-blue-300"
    />
  ),
  success: (
    <FontAwesomeIcon
      icon={faCheckCircle}
      className="size-5 shrink-0 text-green-400 dark:text-green-300"
    />
  ),
  warning: (
    <FontAwesomeIcon
      icon={faExclamationTriangle}
      className="size-5 shrink-0 text-yellow-400 dark:text-yellow-300"
    />
  ),
  error: (
    <FontAwesomeIcon
      icon={faTimesCircle}
      className="size-5 shrink-0 text-red-400 dark:text-red-300"
    />
  ),
};

/**
 * Renders an alert box with a specified type, icon, and content.
 *
 * @param type - The type of alert to display, which determines the icon and styling.
 * @param children - The content to display inside the alert.
 * @param className - Additional CSS classes to apply to the alert container.
 * @returns The rendered alert component.
 *
 * @example
 * ```tsx
 * <Alert type="success">Operation completed successfully!</Alert>
 * ```
 */
export default function Alert({
  type = "info",
  children,
  className = "",
}: AlertProps) {
  return (
    <div
      className={classnames(
        "mb-4 flex items-center rounded-md p-4",
        styles[type],
        className,
      )}
      role="alert"
    >
      {icons[type]}
      <div className="ml-3 text-sm">{children}</div>
    </div>
  );
}
