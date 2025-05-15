import { version } from '../../../package.json';

export const environment = {
  production: false,
  appVersion: `${version}-dev`,

  apiUrl: 'http://academ-iq-api-production.up.railway.app',

  settings: {
    auth: {
      accessTokenKey: 'DoPS3ZrQjM',
      refreshTokenKey: 'nmlP8PW2nb',
    },
  },
};