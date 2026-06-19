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

import SidebarNav from "@/components/sidebar-nav";

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
    <div className="grid min-w-0 gap-8 py-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-12 lg:py-10">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <SidebarNav links={links} />
      </aside>
      <main
        className="prose max-w-none min-w-0 flex-1 dark:prose-invert"
        data-pagefind-body
      >
        {children}
      </main>
    </div>
  );
}
