import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools | AHORN - Aachen Higher-Order Repository of Networks",
  description: "A collection of tools for analyzing and visualizing networks.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-3xl py-32">
      <h1 className="text-3xl font-bold text-gray-900">Tools</h1>
      <p className="mt-4 text-gray-600">
        This page will contain various tools for analyzing and visualizing
        networks.
      </p>
      <p className="mt-2 text-gray-600">Stay tuned for updates!</p>
    </div>
  );
}
