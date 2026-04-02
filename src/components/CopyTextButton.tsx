"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import Button from "@/components/button";
import Toast from "@/components/toast";

export default function CopyTextButton({
  text,
  label,
  successMessage,
  errorMessage,
  className = "cursor-pointer px-0 py-0 text-xs font-semibold text-primary hover:text-primary",
}: {
  text: string;
  label: React.ReactNode;
  successMessage: string;
  errorMessage: string;
  className?: string;
}) {
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
    visible: boolean;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;

    const hideTimeout = window.setTimeout(() => {
      setToast((current) => (current ? { ...current, visible: false } : null));
    }, 2000);
    const removeTimeout = window.setTimeout(() => setToast(null), 2300);

    return () => {
      window.clearTimeout(hideTimeout);
      window.clearTimeout(removeTimeout);
    };
  }, [toast]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({
        message: successMessage,
        variant: "success",
        visible: true,
      });
    } catch {
      setToast({
        message: errorMessage,
        variant: "error",
        visible: true,
      });
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="text"
        className={className}
        onClick={handleCopy}
      >
        {label}
      </Button>
      {toast &&
        createPortal(
          <Toast
            message={toast.message}
            variant={toast.variant}
            visible={toast.visible}
          />,
          document.body,
        )}
    </>
  );
}
