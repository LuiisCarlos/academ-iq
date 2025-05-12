import { version } from '../../../package.json';

export const environment = {
  production: false,
  appVersion: `${version}-dev`,

  apiUrl: 'academ-iq-api-production.up.railway.app',
  //apiUrl: 'http://172.20.10.3:8888',

  settings: {
    auth: {
      accessTokenKey: 'DoPS3ZrQjM',
      refreshTokenKey: 'nmlP8PW2nb',
    },
  },
};