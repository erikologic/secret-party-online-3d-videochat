const path = require('path');

module.exports = {
  entry: './src/app/index.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'www/dist'),
  },
  optimization: {
    minimize: false
  },
  devtool: "source-map"
};
