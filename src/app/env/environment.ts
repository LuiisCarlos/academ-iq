import { version } from '../../../package.json';

export const environment = {
  production: false,
  appVersion: `${version}-dev`,

  apiUrl: 'http://192.168.18.99:8888',
  //apiUrl: 'http://172.20.10.3:8888',

  settings: {
    auth: {
      accessTokenKey: 'DoPS3ZrQjM',
      refreshTokenKey: 'nmlP8PW2nb',
    },
  },
};