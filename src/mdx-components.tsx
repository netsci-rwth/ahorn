import Link from "next/link";
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children }: { href: string; children: React.ReactNode }) => {
      const isInternal = href && href.startsWith("/");

      if (isInternal) {
        return <Link href={href}>{children}</Link>;
      }
      return (
        <a href={href} target="_blank">
          {children}
        </a>
      );
    },
    pre: ({ children }) => (
      <pre className="not-prose my-6 overflow-x-auto rounded-sm">
        {children}
      </pre>
    ),
    ...components,
  };
}
