const path= require('path');

module.exports = {
	entry: path.join(__dirname, "/src/canvasMindMap.ts"),
	output: {
    filename: "index.js",
    path: __dirname
	},
	module: {
    rules: [
      {
        test: /\.ts(x?)$/, 
        loader: "ts-loader",
        exclude: "/node_modules/"
      }
    ]
	},
	resolve: {
    extensions: [".ts", ".tsx"],
    mainFields: [
      'module', // adds check for 'module'
      'webpack',
      'browser',
      'web',
      'browserify',
      ['jam', 'main'],
      'main',
    ]
	}
}