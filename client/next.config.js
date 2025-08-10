module.exports = {
  // allowedDevOrigins:["tickets.dev"],
  experimental: {
    allowedDevOrigins: ["http://www.vivekdevs.site"],
  },
  webpack: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
