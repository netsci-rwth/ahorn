import {
  faBox,
  faChartPie,
  faCircleInfo,
  faCode,
  faFileCode,
  faHandshake,
  faGavel,
  faShieldHalved,
  faSection,
} from "@fortawesome/free-solid-svg-icons";

import AboutSidebarNav from "@/components/about-sidebar-nav";

const links = {
  About: [
    { href: "/about", label: "About", icon: faCircleInfo },
    { href: "/about/format", label: "Dataset Format", icon: faFileCode },
    { href: "/about/ahorn-loader", label: "ahorn-loader", icon: faBox },
  ],
  Contributing: [
    {
      href: "/about/contributing",
      label: "Contributing Guidelines",
      icon: faHandshake,
    },
    { href: "/about/datasheet", label: "Datasheet Page", icon: faChartPie },
    { href: "/about/dataset-converter", label: "Converter", icon: faCode },
    { href: "/about/code-of-conduct", label: "Code of Conduct", icon: faGavel },
  ],
  Legal: [
    { href: "/about/privacy", label: "Privacy Policy", icon: faShieldHalved },
    { href: "/about/imprint", label: "Legal Notice", icon: faSection },
  ],
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="gap-8 sm:flex">
      <aside className="sm:sticky sm:top-24 sm:w-72 sm:shrink-0 sm:self-start">
        <AboutSidebarNav links={links} />
      </aside>
      <main
        className="prose max-w-none flex-1 max-sm:mt-8 sm:min-w-0 dark:prose-invert"
        data-pagefind-body
      >
        {children}
      </main>
    </div>
  );
}
