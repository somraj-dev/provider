import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import path from 'path';
import fs from 'fs';

function copyRecursiveSync(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    name: 'AxioVital Provider',
    executableName: 'axiovital-provider',
    asar: true,
    // afterCopy runs after files are copied into the staging dir, BEFORE asar creation.
    // This is the correct hook to inject the pre-built Next.js renderer + preload.
    afterCopy: [
      (buildPath: string, _electronVersion: string, _platform: string, _arch: string, callback: (err?: Error) => void) => {
        try {
          // 1. Copy the Next.js static export (renderer) into the packaged app
          const rendererSrc = path.resolve(__dirname, 'src', 'renderer');
          const rendererDest = path.join(buildPath, '.vite', 'renderer', 'main_window');

          if (fs.existsSync(rendererSrc)) {
            copyRecursiveSync(rendererSrc, rendererDest);
            console.log(`✅ Copied renderer into: ${rendererDest}`);
          } else {
            console.warn(`⚠️ Renderer source not found: ${rendererSrc}`);
          }

          // 2. Copy the preload script build output
          // The VitePlugin builds preload but doesn't always include it.
          // Check if .vite directory has the preload
          const viteDir = path.resolve(__dirname, '.vite');
          const preloadSrc = path.join(viteDir, 'build', 'preload.js');
          const preloadDestDir = path.join(buildPath, '.vite', 'build');
          const preloadDestFile = path.join(preloadDestDir, 'preload.js');

          // Ensure destination directory exists
          fs.mkdirSync(preloadDestDir, { recursive: true });

          if (fs.existsSync(preloadSrc)) {
            fs.copyFileSync(preloadSrc, preloadDestFile);
            console.log(`✅ Copying preload from local source: ${preloadSrc} -> ${preloadDestFile}`);
          } else {
            // Check if it was built in preload target dir instead
            const altPreloadSrc = path.resolve(__dirname, 'dist', 'preload.js');
            if (fs.existsSync(altPreloadSrc)) {
              fs.copyFileSync(altPreloadSrc, preloadDestFile);
              console.log(`✅ Copying preload from alt source: ${altPreloadSrc} -> ${preloadDestFile}`);
            } else {
              console.warn(`⚠️ Preload source not found anywhere! checked: ${preloadSrc} and ${altPreloadSrc}`);
            }
          }

          callback();
        } catch (err) {
          callback(err as Error);
        }
      },
    ],
    // TODO: Add icon paths
    // icon: './resources/icons/icon',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'axiovital-provider',
    }),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        {
          entry: 'src/main/index.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
  ],
};

export default config;
