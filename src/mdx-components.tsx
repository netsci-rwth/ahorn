import React from "react";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";

import Alert from "@/components/alert";

type AlertType = React.ComponentProps<typeof Alert>["type"];

const GITHUB_ALERT_PATTERN =
  /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:[ \t]*\r?\n)?([\s\S]*)$/;

function isBlankTextNode(child: React.ReactNode): boolean {
  return typeof child === "string" && child.trim() === "";
}

function parseAlertMarker(
  text: string,
): { type: AlertType; remainingText: string } | null {
  const match = text.match(GITHUB_ALERT_PATTERN);
  if (!match) {
    return null;
  }

  return {
    type: match[1].toLowerCase() as AlertType,
    remainingText: match[2],
  };
}

function compactChildren(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).filter(
    (child) => !isBlankTextNode(child),
  );
}

function parseGithubAlert(children: React.ReactNode): {
  type: AlertType;
  children: React.ReactNode;
} | null {
  const blockquoteChildren = compactChildren(children);
  const firstChild = blockquoteChildren[0];

  if (typeof firstChild === "string") {
    const alert = parseAlertMarker(firstChild);
    if (!alert) {
      return null;
    }

    const alertChildren = [...blockquoteChildren];

    if (alert.remainingText.trim() === "") {
      alertChildren.shift();
    } else {
      alertChildren[0] = alert.remainingText;
    }

    return {
      type: alert.type,
      children: alertChildren,
    };
  }

  if (!React.isValidElement<{ children?: React.ReactNode }>(firstChild)) {
    return null;
  }

  const firstParagraphChildren = compactChildren(firstChild.props.children);
  if (firstParagraphChildren.length === 0) {
    return null;
  }

  const contentStart = firstParagraphChildren[0];
  if (typeof contentStart !== "string") {
    return null;
  }

  const alert = parseAlertMarker(contentStart);
  if (!alert) {
    return null;
  }

  const remainingChildren = [
    ...(alert.remainingText.trim() === "" ? [] : [alert.remainingText]),
    ...firstParagraphChildren.slice(1),
  ].filter((child) => !isBlankTextNode(child));

  const alertChildren = [...blockquoteChildren];
  if (remainingChildren.length === 0) {
    alertChildren.shift();
  } else {
    alertChildren[0] = React.cloneElement(
      firstChild,
      undefined,
      ...remainingChildren,
    );
  }

  return {
    type: alert.type,
    children: alertChildren,
  };
}

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
    blockquote: ({ children }: { children: React.ReactNode }) => {
      const alert = parseGithubAlert(children);
      if (alert) {
        return <Alert type={alert.type}>{alert.children}</Alert>;
      }

      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic dark:border-gray-700">
          {children}
        </blockquote>
      );
    },
    ...components,
  };
}
