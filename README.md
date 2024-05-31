# JSTQL JavaScript Transform tool

This tool is created to transform JavaScript based on definitions written in a custom DSL called JSTQL

## JSTQL

This is a DSL created to define proposal transformations using templates. A transformation is defined by two templates, a template of what code snippets to search for **applicable to** and a template of how to transform those snippets **transform to**.

Examples of definitions for proposals can be found in [dsl_files](./dsl_files/)

## Running this project

This project exposes an api in the file [transform/transfrom.ts](./src/transform/transform.ts), which is meant to be used as this library's entry point.

To run this code as a standalone project, a file [index.ts](./index.ts) exists to facilitate running this project.

This project is created using TypeScript, and it is recommended to use [Bun](https://bun.sh/) to compile and run it.

### Building Langium required files

Firstly, building langium is required, this is done by the following:

```sh
# cd into JSTQL
cd JSTQL

# Install dependencies
npm i

# Build langium generated files
npm run langium:generate

# Build final JS source
npm run build
```

### Running a transformation

Now we are ready to run this project with the pipeline on a test JS file:

```sh
# cd into top level
cd ..

# Install dependencies
bun i

# Run an example transformation
bun run index.ts dsl_files/pipeline.jstql test_files/test.js
```

### Arguments of index.ts

Arguments

-   First positional is path to JSTQL
-   Second positional is path to JS file to transform
-   -o is optional output path, if not given path is **./out.js**
