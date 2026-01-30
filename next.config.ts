import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import "./src/env/server";
import "./src/env/client";

const withNextIntl = createNextIntlPlugin({
  experimental: {
    // Relative path(s) to source files
    srcPath: './src',

    extract: {
      // Defines which locale to extract to
      sourceLocale: 'en'
    },

    messages: {
      // Relative path to the directory
      path: './messages',

      // Either 'json' or 'po'
      format: 'json',

      // Either 'infer' to automatically detect locales based on
      // matching files in `path` or an explicit array of locales
      locales: 'infer'
    }
  }
});

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Config options here
};

export default withNextIntl(nextConfig);