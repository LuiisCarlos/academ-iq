import { version } from '../../../package.json';

export const environment = {
  production: true,
  appVersion: version,

  apiUrl: 'http://192.168.18.99:8888',

  settings: {
    auth: {
      accessTokenKey: 'DoPS3ZrQjM',
      refreshTokenKey: 'nmlP8PW2nb',
    },
  },
};