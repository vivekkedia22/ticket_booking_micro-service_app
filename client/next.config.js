module.exports = {
  // allowedDevOrigins:["tickets.dev"],
  experimental: {
    allowedDevOrigins: ["http://tickets.dev"],
  },
  webpack: (config) => {
    config.watchOptions.poll = 300;
    return config;
  },
};
