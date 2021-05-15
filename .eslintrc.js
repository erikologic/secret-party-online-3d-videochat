module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ["@typescript-eslint", "simple-import-sort", "prettier"],
    extends: [
        "eslint:recommended",
        "plugin:prettier/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        '@typescript-eslint/ban-ts-ignore': 'warn'
    }
  };