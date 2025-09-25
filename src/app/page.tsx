import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AHORN - Aachen Higher-Order Repository of Networks",
  description:
    "Comprehensive repository of research-quality simplicial complex, cell complex, and hypergraph datasets for higher-order network science.",
};

export default function Home() {
  return (
    <>
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="sm:-top-90 absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="to-primary-light aspect-1155/678 w-144.5 rotate-30 bg-linear-to-tr sm:w-288.75 relative left-[calc(50%-11rem)] -translate-x-1/2 from-cyan-400 opacity-30 sm:left-[calc(50%-30rem)]"
          />
        </div>
        <div className="mx-auto max-w-3xl py-32">
          {/* flare to advertise other projects */}
          {/* <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
              Announcing our workshop on higher-order opportunities and
              challenges.{" "}
              <a
                href="https://conf.netsci.rwth-aachen.de/"
                className="text-primary font-semibold"
              >
                <span aria-hidden="true" className="absolute inset-0" />
                Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div> */}

          <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
              Aachen Higher-Order Repository of Networks
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-500 sm:text-xl/8">
              Comprehensive repository of research-quality simplicial complex,
              cell complex, and hypergraph datasets for higher-order network
              science.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4 sm:gap-x-6">
              <Link
                href="/dataset"
                className="bg-primary inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white shadow-sm"
              >
                Explore Datasets
              </Link>
              <Link
                href="/about/contributing"
                className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-900"
              >
                Contribute a Dataset
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-900"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-45rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="aspect-1155/678 w-144.5 bg-linear-to-tr sm:w-288.75 to-primary-light relative left-[calc(50%+3rem)] -translate-x-1/2 from-cyan-400 opacity-30 sm:left-[calc(50%+36rem)]"
          />
        </div>
      </div>

      <div className="prose max-w-none">
        <h2>What is AHORN?</h2>
        <p>
          AHORN is a repository of higher-order network datasets, providing
          researchers with access to a wide range of resources for their
          studies. It is designed to facilitate research and development in the
          field of higher-order networks by offering a variety of datasets that
          can be used for benchmarking, testing algorithms, and exploring new
          concepts in network science.
        </p>

        <h2>Work in Progress</h2>
        <p>
          AHORN was introduced at the{" "}
          <a href="https://conf.netsci.rwth-aachen.de/">
            Higher Order Opportunities and Challenges
          </a>{" "}
          workshop, which took place from the 11th to the 13th of August 2025 in
          Aachen, Germany. The repository is currently under development, and we
          are actively working on expanding the dataset collection and improving
          the user experience.{" "}
          <b>We welcome contributions from the community</b>, including dataset
          submissions, feedback, and suggestions for improvement.
        </p>
      </div>
    </>
  );
}
