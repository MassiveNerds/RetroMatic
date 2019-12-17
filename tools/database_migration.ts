const fs = require('fs');

try {
  const rawData = fs.readFileSync('./data/agile-retrospective-6f3a0-export.json', 'utf8');
  const oldData = JSON.parse(rawData);
  const newData = {};

  // Retroboards
  const retroboards = oldData.retroboards;
  const mappedRetroboards = Object.keys(retroboards)
    .flatMap(uid => {
      return Object.keys(retroboards[uid]).map(retroboardId => {
        const retroboard = retroboards[uid][retroboardId];
        retroboard.creatorId = uid;
        retroboard.retroboardId = retroboardId;
        return retroboard;
      });
    })
    .reduce((acc, current) => {
      const id = current.retroboardId;
      delete current.retroboardId;
      acc[id] = current;
      return acc;
    }, {});

  newData['retroboards'] = mappedRetroboards;

  // Buckets
  const buckets = oldData.buckets;
  const mappedBuckets = Object.keys(buckets)
    .flatMap(retroboardId => {
      return Object.keys(buckets[retroboardId]).map(bucketId => {
        if (!mappedRetroboards[retroboardId]) {
          return [];
        }
        const bucket = buckets[retroboardId][bucketId];
        bucket.creatorId = mappedRetroboards[retroboardId].creatorId;
        bucket.retroboardId = retroboardId;
        bucket.bucketId = bucketId;
        return bucket;
      });
    })
    .reduce((acc, current) => {
      const id = current.bucketId;
      delete current.bucketId;
      acc[id] = current;
      return acc;
    }, {});

  newData['buckets'] = mappedBuckets;

  // Notes
  const notes = oldData.notes;
  const mappedNotes = Object.keys(notes)
    .flatMap(bucketId => {
      return Object.keys(notes[bucketId]).map(noteId => {
        if (!mappedBuckets[bucketId]) return [];
        const note = notes[bucketId][noteId];
        note.voteCount = note.totalVotes;
        delete note.totalVotes;
        note.bucketId = bucketId;
        note.retroboardId = mappedBuckets[bucketId].retroboardId;
        note.creatorId = mappedBuckets[bucketId].creatorId;
        note.noteId = noteId;
        return note;
      });
    })
    .reduce((acc, current) => {
      const id = current.noteId;
      delete current.noteId;
      acc[id] = current;
      return acc;
    }, {});

  newData['notes'] = mappedNotes;

  fs.writeFileSync('./data/retromatic-3-data-migration.json', JSON.stringify(newData));
} catch (err) {
  console.error(err);
}
