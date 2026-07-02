import {
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const variants = {
  note: {
    label: "Note",
    icon: faInfoCircle,
    panel:
      "border-l-blue-100 bg-blue-10/55 dark:border-l-blue-50 dark:bg-blue-100/10",
    heading: "text-blue-100 dark:text-blue-50",
  },
  tip: {
    label: "Tip",
    icon: faCheckCircle,
    panel:
      "border-l-green-100 bg-green-10/70 dark:border-l-green-50 dark:bg-green-100/10",
    heading: "text-green-100 dark:text-green-50",
  },
  important: {
    label: "Important",
    icon: faExclamationTriangle,
    panel:
      "border-l-purple-100 bg-purple-10/70 dark:border-l-purple-50 dark:bg-purple-100/10",
    heading: "text-purple-100 dark:text-purple-50",
  },
  warning: {
    label: "Warning",
    icon: faExclamationTriangle,
    panel:
      "border-l-orange-100 bg-orange-10/80 dark:border-l-orange-50 dark:bg-orange-100/10",
    heading: "text-orange-100 dark:text-orange-50",
  },
  caution: {
    label: "Caution",
    icon: faTimesCircle,
    panel:
      "border-l-red-100 bg-red-10/70 dark:border-l-red-50 dark:bg-red-100/10",
    heading: "text-red-100 dark:text-red-50",
  },
};

const markerPattern =
  /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(?:\r?\n)?/;

function iconNode(definition, classValue) {
  const [width, height, , , path] = definition.icon;
  return {
    type: "element",
    tagName: "svg",
    properties: {
      ariaHidden: "true",
      focusable: "false",
      viewBox: `0 0 ${width} ${height}`,
      className: [`size-3.5 shrink-0 ${classValue}`],
    },
    children: [
      {
        type: "element",
        tagName: "path",
        properties: { fill: "currentColor", d: path },
        children: [],
      },
    ],
  };
}

function contentWithoutMarker(node, paragraphIndex, textIndex, firstText) {
  const paragraph = node.children[paragraphIndex];
  const value = firstText.value.replace(markerPattern, "");
  const paragraphChildren = paragraph.children.slice();

  if (value === "") {
    paragraphChildren.splice(textIndex, 1);
  } else {
    paragraphChildren[textIndex] = { ...firstText, value };
  }

  const children = node.children.slice();
  if (paragraphChildren.length === 0) {
    children.splice(paragraphIndex, 1);
  } else {
    children[paragraphIndex] = { ...paragraph, children: paragraphChildren };
  }
  return children;
}

function transformAlert(node) {
  const paragraphIndex = node.children.findIndex(
    (child) => child.type === "element" && child.tagName === "p",
  );
  if (paragraphIndex === -1) return;

  const firstParagraph = node.children[paragraphIndex];
  const textIndex = firstParagraph.children.findIndex(
    (child) => child.type === "text",
  );
  if (textIndex === -1) return;

  const firstText = firstParagraph.children[textIndex];
  const match = firstText.value.match(markerPattern);
  if (!match) return;

  const type = match[1].toLowerCase();
  const variant = variants[type];

  return {
    type: "element",
    tagName: "div",
    properties: {
      className: [
        `my-5 rounded-md border border-l-4 border-black-10 px-4 py-3 text-black-100 dark:border-black-75/45 dark:text-white ${variant.panel}`,
      ],
      role: "alert",
    },
    children: [
      {
        type: "element",
        tagName: "div",
        properties: {
          className: [
            `flex items-center gap-2 text-sm font-semibold ${variant.heading}`,
          ],
        },
        children: [
          iconNode(variant.icon, variant.heading),
          {
            type: "element",
            tagName: "span",
            properties: {},
            children: [{ type: "text", value: variant.label }],
          },
        ],
      },
      {
        type: "element",
        tagName: "div",
        properties: {
          className: [
            "mt-2 text-sm leading-6 text-black-75 dark:text-black-25 [&_ol]:my-0 [&_ol]:pl-5 [&_p]:my-0 [&_p+p]:mt-3 [&_ul]:my-0 [&_ul]:pl-5",
          ],
        },
        children: contentWithoutMarker(
          node,
          paragraphIndex,
          textIndex,
          firstText,
        ),
      },
    ],
  };
}

export default {
  name: "github-alerts",
  element: {
    filter: ["blockquote"],
    visit(node) {
      return transformAlert(node);
    },
  },
};
