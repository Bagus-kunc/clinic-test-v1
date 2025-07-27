import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'vue/script-setup-no-uses-vars': 'off',
    'vue/multi-word-component-names': 0,
    '@typescript-eslint/no-this-alias': 'off',
    'vue/attribute-hyphenation': 'off',
    "vue/html-self-closing": ["error", {
      "img":"never"
    }]
  },
});
