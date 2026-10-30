import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: { globals: globals.browser },
    rules: {
      // Segurança: o projeto monta DOM com o helper h(), nunca com HTML em string.
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'Use h() de src/core/dom.ts (evita XSS).' },
        { property: 'outerHTML', message: 'Use h() de src/core/dom.ts (evita XSS).' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.property.name='insertAdjacentHTML']",
          message: 'Use h() de src/core/dom.ts (evita XSS).',
        },
      ],
      'no-eval': 'error',
      'no-implied-eval': 'error',
    },
  },
);
