export default {
  name: "Daily Language Quiz",
  slug: "daily-language-quiz",
  scheme: "dailylanguagequiz",
  orientation: "portrait",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  ios: {
    bundleIdentifier: "com.dailylanguagequiz.app",
    supportsTablet: true,
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsLocalNetworking: true,
      },
    },
  },
  android: {
    package: "com.dailylanguagequiz.app",
    usesCleartextTraffic: true,
  },
  extra: {
    baseUrl: process.env.BASE_URL || "http://127.0.0.1:8787",
  },
};
