import { defineConfig } from 'vite';
import url from 'url';
import path from 'path';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command, mode }) => ({
//   base: command === 'build' ? '/etc.clientlibs/<project>/clientlibs/' : '/',

  // publicDir: command === 'build' ? false : 'src/assets',

  build: {
    brotliSize: false,
    manifest: false,
    minify: mode === 'development' ? false : 'terser',
    outDir: 'docs/samples',
    emptyOutDir: false,
    assetsDir : 'assets',
    sourcemap: command === 'serve' ? 'inline' : false,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'pxts',
      formats : ['es'],
      // the proper extensions will be added
      fileName: 'pxts',
    }

  },

  server: {
    origin: 'http://localhost:3000',
  },
}));
