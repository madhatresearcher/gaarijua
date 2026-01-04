const nextConfig = require('eslint-config-next/core-web-vitals');

module.exports = nextConfig.map((config) => {
	if (config.name === 'next') {
		return {
			...config,
			rules: {
				...config.rules,
				'@next/next/no-img-element': 'warn',
				'react-hooks/set-state-in-effect': 'off',
				'react-hooks/refs': 'off',
				'react-hooks/purity': 'off',
				'react/no-unescaped-entities': 'off',
			},
		}
	}
	return config
});
