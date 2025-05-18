import { version } from '../../../package.json';

export const environment = {
  production: true,
  appVersion: version,

  apiUrl: 'https://academ-iq-api-production.up.railway.app',

  settings: {
    auth: {
      accessTokenKey: 'DoPS3ZrQjM',
      refreshTokenKey: 'nmlP8PW2nb',
    },
  },
};