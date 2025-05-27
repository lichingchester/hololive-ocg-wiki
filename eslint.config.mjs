// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "warn",
      "vue/no-v-html": "off", // Allow v-html for demonstration purposes
      "tprefer-const": "warn",
    },
  }
);
