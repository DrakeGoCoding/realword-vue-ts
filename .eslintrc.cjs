/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
	root: true,
	parser: 'vue-eslint-parser',
	extends: [
		'plugin:vue/vue3-essential',
		'eslint:recommended',
		'@vue/eslint-config-typescript',
		'@vue/eslint-config-prettier'
	],
	parserOptions: {
		ecmaVersion: 'latest',
		parser: '@typescript-eslint/parser',
		sourceType: 'module',
		extraFileExtensions: ['.vue']
	},
	rules: {
		'@typescript-eslint/explicit-function-return-type': 'off'
	},
	overrides: [
		{
			files: ['src/composable/*.ts', 'src/**/use*.ts'],
			rules: {
				'@typescript-eslint/explicit-module-boundary-types': 'off'
			}
		},
		{
			files: ['src/**/*.{cy,spec}.{js,ts,jsx,tsx}'],
			extends: ['plugin:cypress/recommended'],
			rules: {
				// `expect(true).to.be.true` is a valid expression
				'no-unused-expressions': 'off'
			}
		}
	]
};
