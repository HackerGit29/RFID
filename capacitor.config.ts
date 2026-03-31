import {CapacitorConfig} from "@capacitor/cli";
import { networkInterfaces } from "os";

const config: CapacitorConfig = {
  appId: "com.capacitor.livereload",
  appName: "CapacitorLiveReload",
  webDir: "dist",
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    loggingBehavior: "none"
  },
  ios: {
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
}

if (process.env.NODE_ENV !== 'production') {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    if (!nets[name]) continue;
    for (const net of nets[name]) {
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
      if (net.family === familyV4Value && !net.internal) {
        results.push(net.address);
      }
    }
  }

  // You might want to take a look at this line
  // Change url to any local address that match your situation.
  // At this time, I take the first ip.
  config.server.url = `http://${results[0]}:5173/`;
  console.log('Development mode, bundle is load from', config.server.url);
}

export default config;
