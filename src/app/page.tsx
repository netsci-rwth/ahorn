import Link from "next/link";
import type { Metadata } from "next";
import Button from "@/components/button";
import DatasetCardList from "@/components/dataset-card-list";

export const metadata: Metadata = {
  title: "AHORN - Aachen Higher-Order Repository of Networks",
  description:
    "Comprehensive repository of research-quality simplicial complex, cell complex, and hypergraph datasets for higher-order network science.",
};

const POPULAR_DATASET_SLUGS = [
  "karate-club",
  "contact-high-school",
  "dblp-coauthorship",
  "senate-bills",
  "algebra-questions",
  "walmart-trips",
] as const;

const POPULAR_DATASET_SUMMARIES = {
  "karate-club":
    "A compact classic benchmark for exploring community structure and higher-order representations.",
  "contact-high-school":
    "Temporal proximity data from a school setting, useful for social interaction and contact-pattern studies.",
  "dblp-coauthorship":
    "Scholarly collaboration data built from co-authorship patterns in computer science.",
  "senate-bills":
    "Legislative sponsorship data capturing relationships between senators and bills.",
  "algebra-questions":
    "Question-answer interactions around algebra topics, with labeled higher-order question categories.",
  "walmart-trips":
    "Retail basket data that turns shopping trips into higher-order co-purchase structure.",
} satisfies Partial<Record<(typeof POPULAR_DATASET_SLUGS)[number], string>>;

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
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-blue-50 to-blue-100 opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>
        <div className="w-full py-14 sm:py-18">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_20rem] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance text-black-100 sm:text-6xl lg:text-7xl dark:text-white">
                Aachen Higher-Order Repository of Networks
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-pretty text-black-75 sm:text-xl dark:text-black-25">
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
                <div key={title} className="border-l-2 border-blue-75 pl-5">
                  <p className="text-sm font-semibold tracking-widest text-blue-100 uppercase">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black-75 dark:text-black-25">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 sm:mt-20" aria-labelledby="popular-datasets">
        <h2
          id="popular-datasets"
          className="mb-7 text-3xl font-semibold tracking-tight text-black-100 dark:text-white"
        >
          Popular Datasets
        </h2>

        <DatasetCardList
          slugs={POPULAR_DATASET_SLUGS}
          summaries={POPULAR_DATASET_SUMMARIES}
        />
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div>
          <div className="prose max-w-none dark:prose-invert">
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
          <p className="text-sm font-semibold tracking-widest text-blue-100 uppercase">
            Work in Progress
          </p>
          <p className="mt-4 text-sm leading-7 text-black-75 dark:text-black-25">
            AHORN was introduced at the{" "}
            <a
              href="https://conf.netsci.rwth-aachen.de/"
              className="font-semibold text-blue-100"
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
