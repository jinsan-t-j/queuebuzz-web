import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default [
    js.configs.recommended,
    ...vue.configs['flat/recommended'],
    prettier,
    {
        rules: {
            'vue/component-api-style': ['error', ['script-setup']],
            'vue/define-macros-order': ['error', { order: ['defineProps', 'defineEmits'] }],
            'vue/no-v-html': 'error',   // XSS — hard ban
            'vue/require-default-prop': 'error',
            'vue/require-prop-types': 'error',
            'vue/no-unused-vars': 'error',
            'vue/html-self-closing': 'error',
            'vue/component-name-in-template-casing': ['error', 'PascalCase'],
            'vue/no-multiple-template-root': 'off',
            'no-console': 'warn',
            'no-debugger': 'error',
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
]
