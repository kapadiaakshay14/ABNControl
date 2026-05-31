import microsoftPowerApps from "@microsoft/eslint-plugin-power-apps";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@microsoft/power-apps": microsoftPowerApps,
    },
    rules: {
      ...(microsoftPowerApps.configs?.recommended?.rules ?? {}),
    },
  },
  {
    ignores: ["**/generated/**", "out/**", "node_modules/**"],
  },
];
