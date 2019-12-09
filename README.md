<!-- markdownlint-disable MD033 MD041 -->
<div align="center" >
  <img src="src/assets/massive-nerds-logo.png" alt="Massive Nerds" title="Massive Nerds" width="300px" />
  <br/>
  <br/>
  RetroMatic, a real-time retrospective tool.
  <hr />

[![Build Status](https://img.shields.io/travis/massivenerds/retromatic/master.svg?style=for-the-badge)](http://travis-ci.org/massivenerds/retromatic) [![npm](https://img.shields.io/github/tag/massivenerds/retromatic.svg?style=for-the-badge)](https://github.com/massivenerds/retromatic) [![Twitter](https://img.shields.io/twitter/follow/massivenerds.svg?style=for-the-badge&logo=twitter&label=Follow)](https://twitter.com/massivenerds) [![Ko-fi](https://img.shields.io/badge/Ko--fi-Donate-red?style=for-the-badge&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAOCAYAAAArMezNAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVBwuKOASsThZERRxLFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi4uqk6CIl/i8ptIjx4Lgf7+497t4BQqPCVLNrElA1y0jFY2I2tyoGXhFEAAJGMSgxU0+kFzPwHF/38PH1LsKzvM/9OfqUvMkAn0gcZbphEW8Qz25aOud94hArSQrxOfGEQRckfuS67PIb56LDAs8MGZnUPHGIWCx2sNzBrGSoxDPEYUXVKF/Iuqxw3uKsVmqsdU/+wmBeW0lzneYI4lhCAkmIkFFDGRVYiNCqkWIiRfsxD/+w40+SSyZXGYwcC6hCheT4wf/gd7dmYXrKTQrGgO4X2/4YAwK7QLNu29/Htt08AfzPwJXW9lcbwNwn6fW2Fj4C+reBi+u2Ju8BlzvA0JMuGZIj+WkKhQLwfkbflAMGboHeNbe31j5OH4AMdbV8AxwcAuNFyl73eHdPZ2//nmn19wNNFHKYraX99QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB+MMBwIkKMP6iwYAAAFOSURBVDjLrZQ/S0JRGMZ/5zq0OJiDbnInh0DMQYQgB8fQPoLNrX6FJif9CK61RGQFQbNbOgVBxt3EQgq0kBSehm54b3rT/jzL4Tzve36c95z3HCR19Xe9STqTtMWn9P/aBzCSxO/1BFwAEWDH4+fnwe02OA5Eo5DNwngMrRaMRpDLgW17szvGmIxb+S5w4vpNP7jTgXp9tsy2YTCA4XDmVasQj8+BXfg1kAGeLd9uez1/oY7jhwL0+98dzas7RvzgWGz5qUYiC21JYWDDnd77wek0JJPB0FIJEgmvsyYp5rbZObDu+ofzlzcaQa0G3a4fms/D3h6EQstqugM2rTk7HIZKBVKpmVcoQLm8CvQU2DbGvAT38WQCjcZHBxSLYFmLsh6BI+AGuDLG3K728qbTZa/sMmjrFhAYXKH048CIpISk5g//gwdJB72vfe/ROy+vfJsLrTXVAAAAAElFTkSuQmCC)](https://ko-fi.com/wordythebyrd)

  <hr />
</div>
<!-- markdownlint-disable MD033 MD041 -->

RetroMatic is used for **real-time retrospectives**. See how to leverage **Angular** and **Firebase** for syncing data across all the participants. Retrospective's are held at the end of sprints in Agile software development. The team reflects on what happened in the sprint and determines actions for improvement.

## Local Development

To clone and run this application locally, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

Create a free [Firebase](https://firebase.google.com/) project.  In Firebase console, enable Email/Password, Google, and Anonymous sign-in under the sign-in method tab of the Auth section.

Update firebase config values in `firebase.ts`.  This config file will be ignored from Git. Copy `firebase.example.ts` and rename it to `firebase.ts`. These values can be found in Firebase console here: `Firebase Console > Overview > Add Firebase to your web app`.

```javascript
firebase: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: ''
}
```

```bash
npm install

npm start
```

## Firebase Structure

`$` are Firebase-generated unique IDs.

```bash
├── retroboards
│   └── $retroboardId
│       ├── creator (username)
│       ├── creatorId ($userId)
│       ├── noteCount
│       ├── dateCreated
│       ├── name
│       └── timeZone
├── buckets
│   └── $bucketId
│       ├── retroboardId ($retroboardId)
│       ├── creator (username)
│       ├── creatorId ($userId)
│       └── name
├── notes
│     └── $noteId
│         ├── creator (username)
│         ├── creatorId ($userId)
│         ├── retroboardId ($retroboardId)
│         ├── bucketId ($bucketId)
│         ├── message
│         ├── voteCount
│         └── votes
│             └── $userId
└── users
    └── $userId
        ├── favorites
        │   └── $retroboardId
        ├── md5hash
        └── displayName
```

## Firebase Security Rules

```javascript
{
  "rules": {
    "retroboards": {
      ".read": "auth != null",
      ".indexOn": ["creatorId"],
      "$retroboardId": {
        ".write": "(auth != null && !data.exists()) || data.child('creatorId').val() === auth.uid",
        ".validate": "newData.hasChildren(['creator', 'creatorId', 'noteCount', 'dateCreated', 'name', 'timeZone'])",
        "creator": {
          ".validate": "newData.isString()"
        },
        "creatorId": {
          ".validate": "auth.uid === newData.val() && root.child('users/' + newData.val()).exists()"
        },
        "noteCount": {
          ".validate": "newData.isNumber()"
        },
        "dateCreated": {
          ".validate": "newData.isString()"
        },
        "name": {
          ".validate": "newData.isString()"
        },
        "timeZone": {
          ".validate": "newData.isString()"
        }
      }
    },
    "notes": {
      ".read": "auth != null",
      ".indexOn": ["bucketId", "retroboardId"],
      "$noteId": {
        ".write": "(auth != null && !data.exists()) || data.child('creatorId').val() === auth.uid",
        ".validate": "newData.hasChildren(['creator', 'creatorId', 'retroboardId', 'bucketId', 'message', 'voteCount', 'votes'])",
        "creatorId": {
          ".validate": "auth.uid === newData.val()"
        }
      }
    },
    "buckets": {
      ".read": "auth != null",
      ".indexOn": ["retroboardId"],
      "$bucketId": {
        ".write": "(auth != null && !data.exists()) || data.child('creatorId').val() === auth.uid",
        ".validate": "newData.hasChildren(['creator', 'creatorId', 'retroboardId', 'name'])",
        "creatorId": {
          ".validate": "auth.uid === newData.val()"
        }
      }
    },
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid",
        ".validate": "newData.hasChildren(['displayName', 'md5hash'])",
        "displayName": {
          ".validate": "newData.isString()"
        },
        "md5hash": {
          ".validate": "newData.isString()"
        }
      }
    },
    "$other": { ".validate": false }
  }
}
```

## Firebase Authentication

To set up users, from your Firebase dashboard:

1. Click Authentication
2. Click Sign-in method
3. Enable Email/Password, Google, and Anonymous

## License

MIT.
