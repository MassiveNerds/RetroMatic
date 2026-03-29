const { writeFile } = require('fs');

require('dotenv').config();

const environment = process.argv.find(a => a.startsWith('--environment='))?.split('=')[1];
const isProd = environment === 'prod';

const firebaseBlock = `  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
    databaseURL: '${process.env.FIREBASE_DATABASE_URL}',
    projectId: '${process.env.FIREBASE_PROJECT_ID}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}'
  }`;

const makeConfig = (prod) => `
export const environment = {
  production: ${prod},
${firebaseBlock}
};
`;

const targets = [
  { path: `./src/environments/environment.${environment}.ts`, prod: isProd },
];

// Always write environment.ts so TypeScript can compile it (Angular replaces it at build time)
if (isProd) {
  targets.push({ path: './src/environments/environment.ts', prod: false });
}

targets.forEach(({ path, prod }) => {
  writeFile(path, makeConfig(prod), function (err) {
    if (err) {
      console.log(err);
    }
    console.log(`Output generated at ${path}`);
  });
});
