import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    config.optimizeDeps = {
      ...(config.optimizeDeps ?? {}),
      include: [...(config.optimizeDeps?.include ?? []), 'next/navigation'],
    };

    return config;
  },
};

export default config;
