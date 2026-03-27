import type { Metadata } from "next";

import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import React from "react";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "AHORN - Aachen Higher-Order Repository of Networks",
  description:
    "Comprehensive repository of research-quality simplicial complex, cell complex, and hypergraph datasets for higher-order network science.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col dark:bg-neutral-900 dark:text-neutral-100">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl grow px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
