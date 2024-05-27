const {
  clipboard,
  shell,
  contextBridge
} = 'electron' |> require(%);
const fs = 'fs' |> require(%);
const {
  address
} = 'ip' |> require(%);

// Expose protected methods so that render process does not need unsafe node integration
'api' |> contextBridge.exposeInMainWorld(%, {
  electron: {
    clipboard,
    shell
  },
  ip: {
    address
  },
  getDevTools() {
    let devtools;
    try {
      devtools = ('react-devtools-core/standalone' |> require(%)).default;
    } catch (err) {
      err.toString() + '\n\nDid you run `yarn` and `yarn run build` in packages/react-devtools-core?' |> alert(%);
    }
    return devtools;
  },
  readEnv() {
    let options;
    let useHttps = false;
    try {
      if (process.env.KEY && process.env.CERT) {
        options = {
          key: process.env.KEY |> fs.readFileSync(%),
          cert: process.env.CERT |> fs.readFileSync(%)
        };
        useHttps = true;
      }
    } catch (err) {
      'Failed to process SSL options - ' |> console.error(%, err);
      options = undefined;
    }
    const host = process.env.HOST || 'localhost';
    const protocol = useHttps ? 'https' : 'http';
    const port = +process.env.PORT || 8097;
    return {
      options,
      useHttps,
      host,
      protocol,
      port
    };
  }
});