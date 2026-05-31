# ABN Control (PCF)

A PowerApps Component Framework (PCF) **virtual / React** control that formats
and validates an Australian Business Number (ABN).

## Features

- **Formatting** — auto-formats input as `XX XXX XXX XXX` (e.g. `51 824 753 556`)
  while the user types.
- **Length validation** — requires exactly **11 digits**.
- **Inline error** — shows a Fluent UI error message under the field when invalid.
- **Blocks save** — when invalid, `getOutputs` returns `undefined`, which clears
  the bound column. Combined with `required="true"` in the manifest this
  prevents the record from saving.
- **Built on Fluent UI v9** — uses the platform-shared React + Fluent libraries
  (no bundle bloat).

## Properties

| Name              | Type             | Usage  | Description                                          |
| ----------------- | ---------------- | ------ | ---------------------------------------------------- |
| `abnValue`        | SingleLine.Text  | bound  | The ABN value (stored formatted with spaces).        |
| `placeholderText` | SingleLine.Text  | input  | Placeholder shown when empty.                        |
| `autoFormat`      | TwoOptions       | input  | Toggle the live `XX XXX XXX XXX` formatting.         |

> If you'd rather store the raw 11-digit string in your column, change the
> return value of `getOutputs` in `ABNControl/index.ts` to use `stripToDigits`.

## Project layout

```
ABNControl/
├── ABNControl.pcfproj           # MSBuild project for solution packaging
├── package.json                 # npm scripts + dependencies
├── tsconfig.json                # TypeScript config (extends pcf-scripts base)
├── eslint.config.mjs            # ESLint flat config
├── .gitignore
└── ABNControl/
    ├── ControlManifest.Input.xml
    ├── index.ts                 # PCF entry point (lifecycle)
    ├── components/
    │   ├── ABNInput.tsx         # React/Fluent UI input
    │   └── abnUtils.ts          # format + validate helpers
    ├── css/
    │   └── ABNControl.css
    └── strings/
        └── ABNControl.1033.resx
```

## Prerequisites

- Node.js 18+ and npm
- [Power Platform CLI (`pac`)](https://learn.microsoft.com/power-platform/developer/cli/introduction)
- .NET SDK 6.0+ (only for building the solution `.zip`)

## Build & run locally

```bash
# from the project root
npm install
npm run build           # produces /out/controls/ABNControl
npm start watch         # opens the PCF test harness in a browser
```

## Package into a solution

Run these once to create a solution folder next to the control project, then
build a managed/unmanaged solution zip you can import into Dataverse:

```bash
# 1. Create a Solution folder
mkdir Solution && cd Solution
pac solution init --publisher-name ak --publisher-prefix ak

# 2. Reference this control project
pac solution add-reference --path ..

# 3. Build the solution zip
dotnet build -c Release
# Output: Solution/bin/Release/Solution.zip
```

Import `Solution.zip` into your environment via **Power Apps > Solutions > Import**.

## Adding the control to a form

1. Open the form designer for the table that has your ABN column.
2. Select the column → **Components** → **Add component**.
3. Pick **ABN Control** (publisher `ak`) and bind it to the column.
4. Save & publish.

## Extending validation

The placeholder for the full ATO modulus-89 checksum is in
`components/abnUtils.ts > validateAbn`. Add the weighted-sum check there and the
UI + `getOutputs` wiring will automatically pick it up — no other files need to
change.
