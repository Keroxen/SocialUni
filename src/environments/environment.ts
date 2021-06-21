// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import * as appConfig from '@config/app.config.json';

export const environment = {
    production: false,
    firebase: appConfig.firebaseConfigEnvironmentProductionFalse,

    algolia: {
        appId: 'RWAQLBEIF8',
        apiKey: '2c5e5991f513d07a3c4046f7364a41dd'
    }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
