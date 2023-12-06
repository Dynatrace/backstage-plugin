import packageJson from '../../package.json';

export const getUserAgent = (): string =>
  `${packageJson.name || 'DynatraceDQLPlugin'}/${
    packageJson.version || '0.0.0'
  }`;
