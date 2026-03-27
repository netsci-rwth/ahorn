import Link from "next/link";
import { Metadata } from "next";
import Button from "@/components/button";

export const metadata: Metadata = {
  title: "AHORN - Aachen Higher-Order Repository of Networks",
  description:
    "Comprehensive repository of research-quality simplicial complex, cell complex, and hypergraph datasets for higher-order network science.",
};

export default function Home() {
  return (
    <>
      <section className="relative isolate pt-10">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-32"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-sky-300 to-primary opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>
        <div className="w-full py-14 sm:py-18">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_20rem] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
                Aachen Higher-Order Repository of Networks
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-pretty text-slate-600 sm:text-xl">
                Research-quality simplicial complex, cell complex, and
                hypergraph datasets for benchmarking, method development, and
                reproducible higher-order network science.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button as={Link} href="/dataset" variant="primary">
                  Explore Datasets
                </Button>
                <Button
                  as={Link}
                  href="/about/contributing"
                  variant="secondary"
                >
                  Contribute a Dataset
                </Button>
                <Button as={Link} href="/about" variant="text">
                  Learn more{" "}
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                [
                  "Curated",
                  "Research-oriented curation of datasets and extensive statistics.",
                ],
                ["Browsable", "Search, filter, and compare datasets quickly."],
                [
                  "Citable",
                  "Source attribution and BibTeX-ready references. Datasets indefinitely available on Zenodo.",
                ],
              ].map(([title, copy]) => (
                <div key={title} className="border-l-2 border-primary/20 pl-5">
                  <p className="text-sm font-semibold tracking-widest text-primary uppercase">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div>
          <div className="prose max-w-none">
            <h2>What is AHORN?</h2>
            <p>
              AHORN is a repository of higher-order network datasets, providing
              researchers with access to resources for benchmarking, testing
              algorithms, and exploring new questions in network science.
            </p>
            <p>
              It is built around discoverability and reproducibility: each
              dataset page combines structured metadata, source links, download
              attachments, and citation information in one place.
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            Work in Progress
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            AHORN was introduced at the{" "}
            <a
              href="https://conf.netsci.rwth-aachen.de/"
              className="font-semibold text-primary"
            >
              Higher Order Opportunities and Challenges
            </a>{" "}
            workshop in Aachen from August 11 to August 13, 2025. The repository
            is still expanding, and community contributions remain a central
            part of improving the collection and the overall user experience.
          </p>
        </div>
      </section>
    </>
  );
}
