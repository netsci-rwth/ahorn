"use client";

import { useEffect, useState } from "react";

import Button from "@/components/button";
import Toast from "@/components/toast";

export default function CitationCopyButton({ bibtex }: { bibtex: string }) {
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
      await navigator.clipboard.writeText(bibtex);
      setToast({
        message: "BibTeX copied to clipboard.",
        variant: "success",
        visible: true,
      });
    } catch {
      setToast({
        message: "Could not copy BibTeX.",
        variant: "error",
        visible: true,
      });
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="cursor-pointer px-3 py-1.5 text-xs"
        onClick={handleCopy}
      >
        Copy BibTeX
      </Button>
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          visible={toast.visible}
        />
      )}
    </>
  );
}
