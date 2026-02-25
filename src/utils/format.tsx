const formatter = Intl.NumberFormat("en-US");

/**
 * Converts an attachment tag (e.g., `revision-1`) to a human-readable label.
 *
 * @param attachmentTag - The attachment tag to format.
 * @returns A human-friendly label (e.g., `Revision 1`).
 */
export function formatAttachmentTag(attachmentTag: string): string {
  const match = attachmentTag.match(/^revision-(\d+)$/i);
  if (!match) return attachmentTag;
  return `Revision ${match[1]}`;
}

export function formatNumber(number: number): string {
  return formatter.format(number);
}

/**
 * Converts a file size in bytes to a human-readable string with appropriate units.
 *
 * @param bytes - The file size in bytes.
 * @param decimals - The number of decimal places to include in the formatted output. Defaults to 2.
 * @returns A string representing the formatted file size (e.g., "1.23 MB").
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}
