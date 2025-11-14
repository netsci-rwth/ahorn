import Badge from "@/components/badge";

const tagColors: Record<string, string> = {
  temporal:
    "bg-blue-50 text-blue-800 ring-blue-600/20 dark:bg-blue-900 dark:text-blue-100 dark:ring-blue-400/30",
  synthetic:
    "bg-green-50 text-green-800 ring-green-600/20 dark:bg-green-900 dark:text-green-100 dark:ring-green-400/30",
  biological:
    "bg-pink-50 text-pink-800 ring-pink-600/20 dark:bg-pink-900 dark:text-pink-100 dark:ring-pink-400/30",
  social:
    "bg-purple-50 text-purple-800 ring-purple-600/20 dark:bg-purple-900 dark:text-purple-100 dark:ring-purple-400/30",
  // Add more tag-specific styles as needed
};

export type TagProps = {
  name: string;
};

export default function Tag({ name }: TagProps) {
  const color = tagColors[name.toLowerCase()] || undefined;
  return <Badge color={color}>{name}</Badge>;
}
