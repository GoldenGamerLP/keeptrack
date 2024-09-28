module.exports = {
	globDirectory: 'assets/',
	globPatterns: [
		'**/*.css'
	],
	swDest: 'assets/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};