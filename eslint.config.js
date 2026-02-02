import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // Ignoruj node_modules i dist
  {
    ignores: ['dist/', 'node_modules/', '*.config.js']
  },
  
  // Osnovna JS pravila
  js.configs.recommended,
  
  // TypeScript pravila
  ...tseslint.configs.recommended,
  
  // React pravila
  {
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // Treat these as warnings, not errors
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // React hooks rules as warnings
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
    settings: {
      react: {
        version: '18'
      }
    }
  }
);
