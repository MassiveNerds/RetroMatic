// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyCuJFhpKjEYEQ37Wkh51N6fVel9TCAV9Sg',
    authDomain: 'agile-retrospective-6f3a0.firebaseapp.com',
    databaseURL: 'https://agile-retrospective-6f3a0.firebaseio.com',
    projectId: 'agile-retrospective-6f3a0',
    storageBucket: 'agile-retrospective-6f3a0.appspot.com',
    messagingSenderId: '466997433892'
  }
};
