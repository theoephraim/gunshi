# Documentation Generator

This is an example of using the `usageSilent` option to generate documentation.

## Command Usage

```sh
Documentation Generator Example (doc-generator v1.0.0)
USAGE:
  doc-generator <OPTIONS>

OPTIONS:
  -o, --output [output]          Output directory for documentation
  -f, --format [format]          Output format (markdown, html)
  -t, --title [title]            Documentation title
  -h, --help                     Display this help message
  -v, --version                  Display this version

EXAMPLES:
  # Generate markdown documentation
  $ node index.js --format markdown --output ./docs

  # Generate HTML documentation with custom title
  $ node index.js --format html --title "My CLI Tool" --output ./public

```

## How It Works

This example demonstrates how to:

1. Use the `usageSilent` option to capture usage information
2. Generate documentation from the captured text
3. Save the documentation to a file

## Implementation Details

The key part of this example is using the `cli` function with `usageSilent: true`:

```js
const usageText = await cli(['--help'], command, {
  name: 'doc-generator',
  version: '1.0.0',
  description: 'Documentation Generator Example',
  usageSilent: true // Prevent output to console
})
```

This captures the usage text that would normally be printed to the console,
allowing you to use it in your documentation.
