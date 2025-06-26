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
  info: "bg-blue-50 text-blue-800",
  success: "bg-green-50 text-green-800",
  warning: "bg-yellow-50 text-yellow-800",
  error: "bg-red-50 text-red-800",
};

const icons = {
  info: (
    <FontAwesomeIcon
      icon={faInfoCircle}
      className="size-5 flex-shrink-0 text-blue-400"
    />
  ),
  success: (
    <FontAwesomeIcon
      icon={faCheckCircle}
      className="size-5 flex-shrink-0 text-green-400"
    />
  ),
  warning: (
    <FontAwesomeIcon
      icon={faExclamationTriangle}
      className="size-5 flex-shrink-0 text-yellow-400"
    />
  ),
  error: (
    <FontAwesomeIcon
      icon={faTimesCircle}
      className="size-5 flex-shrink-0 text-red-400"
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
