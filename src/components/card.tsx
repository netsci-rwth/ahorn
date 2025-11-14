import * as React from "react";
import classNames from "classnames";

/**
 * Card component for displaying content in a styled container.
 */
interface CardProps {
  /** Optional title displayed at the top of the card. */
  title?: string;

  /** Card content. */
  children: React.ReactNode;

  /** Additional class names for the card container. */
  className?: string;

  /** Optional button element to display to the right of the title. */
  button?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = "",
  button,
}) => (
  <div
    className={classNames(
      "overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-900 dark:shadow-sm",
      className,
    )}
  >
    {title && (
      <div className="flex items-center justify-between gap-4 px-4 py-6 sm:px-6">
        <h3 className="text-base/relaxed font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {button && <div className="shrink-0">{button}</div>}
      </div>
    )}
    <div
      className={classNames({
        "border-t border-gray-100 dark:border-gray-700": title,
      })}
    >
      {children}
    </div>
  </div>
);

export default Card;
