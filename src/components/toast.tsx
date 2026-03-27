import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

type ToastVariant = "success" | "error";

const variantStyles: Record<ToastVariant, string> = {
  success:
    "border-green-200/80 bg-white/92 text-slate-900 dark:border-green-800 dark:bg-gray-900 dark:text-gray-100",
  error:
    "border-red-200/80 bg-white/92 text-slate-900 dark:border-red-800 dark:bg-gray-900 dark:text-gray-100",
};

const iconStyles: Record<ToastVariant, string> = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
};

const icons: Record<ToastVariant, typeof faCheckCircle> = {
  success: faCheckCircle,
  error: faTimesCircle,
};

export default function Toast({
  message,
  variant = "success",
  visible = true,
}: {
  message: string;
  variant?: ToastVariant;
  visible?: boolean;
}) {
  return (
    <div
      className={classNames(
        "pointer-events-none fixed right-4 bottom-4 z-200 flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_45px_rgb(15_23_42_/_0.14)] backdrop-blur-sm",
        "transition-all duration-300 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        variantStyles[variant],
      )}
      role="status"
      aria-live="polite"
    >
      <FontAwesomeIcon
        icon={icons[variant]}
        className={classNames("size-4 shrink-0", iconStyles[variant])}
      />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
