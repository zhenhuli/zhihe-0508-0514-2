/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  plugins: [],
  routes: [
    { match: 'routes', src: '.*', dest: '/index.html' },
  ],
  optimize: {
    bundle: true,
    minify: true,
    target: 'es2018',
  },
  packageOptions: {
    polyfillNode: true,
  },
  devOptions: {
    port: 8080,
    open: 'default',
  },
  buildOptions: {
    out: 'build',
  },
};
