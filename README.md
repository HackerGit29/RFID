## Capacitor with Hot Reload support
A starter boilerplate for Capacitor with Hot Reload support using Vite. It was built to reduce hassle
reloading and restarting application to see changes.

### How to use?
Clone this project, install dependencies with your favorite package manager like `Yarn`, `npm` or `pnpm`.

```shell
npm install
```

Then, start the dev server (which is content host):

```shell
npm run start
```

Note: This will start vite server in host mode (which will expose `5173` port).

Finally, you can start your dev journey with your favorite platform:

```shell
# Run development app on iOS
npm run dev:ios

# Run development app on Android
npm run dev:android
```

Or you can build the bundle for production
```shell
npm run build
```

### How does it work?
This project was built with:
- React
- Vite
- TailwindCSS
- Capacitor

The content is served by vite development server. You can take a look
at `capacitor.config.ts` file, the script will fetch all local IPs of host machine
then get the first one to supply to capacitor config (as server).

### Production build
Please remember to export `NODE_ENV=production` before doing production build with capacitor
as it will eliminate the `server.url` config in capacitor (this is required).

Have fun coding.

### Issues & Bugs
Please open an issue on GitHub, I'm willing to help.

### Author
[@MonokaiJs](https://delimister.com)
