"use client";

import CopyTextButton from "@/components/CopyTextButton";

export default function CitationCopyButton({ bibtex }: { bibtex: string }) {
  return (
    <CopyTextButton
      text={bibtex}
      label="Copy BibTeX"
      successMessage="BibTeX copied to clipboard."
      errorMessage="Could not copy BibTeX."
    />
  );
}
