# Aachen Higher-Order Repository of Networks (AHORN)

> Comprehensive repository of research-quality simplicial complex, cell complex, and hypergraph datasets for higher-order network science.

To suggest a dataset to add to the repository, either open an issue or check out the [Contributing Guidelines](https://ahorn.rwth-aachen.de/about/contributing).

## Development

The website is generated as static HTML with [Astro](https://astro.build/). React components are used only during the build as server-rendered templates; the site does not hydrate a client-side framework. Small framework-free scripts provide dataset filtering, tabs, copy buttons, and Pagefind search.

```bash
npm install
npm run dev
npm run check
npm run build
```

The production site is written to `dist/` and can be deployed directly to GitHub Pages.

## Funding

<img align="right" width="200" src="https://raw.githubusercontent.com/netsci-rwth/ahorn/main/public/images/erc_logo.png">

Funded by the European Union (ERC, HIGH-HOPeS, 101039827).
Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Research Council Executive Agency.
Neither the European Union nor the granting authority can be held responsible for them.
