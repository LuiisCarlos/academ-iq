import { version } from '../../../package.json';

export const environment = {
  production: false,
  appVersion: `${version}-dev`,

  apiUrl: 'http://localhost:8080',

  settings: {
    auth: {
      accessTokenKey: 'DoPS3ZrQjM',
      refreshTokenKey: 'nmlP8PW2nb',
    },
  },
};