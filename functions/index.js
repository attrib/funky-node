const functions = require('firebase-functions')
const md = require('markdown-it')();
const updateResults = require('./updateResults').updateResults
const admin = require('firebase-admin')
admin.initializeApp()
const firestore = admin.firestore()

exports.renderMarkdown = functions.firestore
  .document('News/{newsId}')
  .onWrite((change, context) => {
    // Retrieve the current and previous value
    const data = change.after.exists ? change.after.data() : null;
    const previousData = change.before.data();

    // This is crucial to prevent infinite loops.
    if (!data || !data.Markdown || (data.Content && data.Markdown === previousData.Markdown)) return null;

    return change.after.ref.set({
      Content: md.render(data.Markdown)
    }, {merge: true});
  });

exports.updateResults = functions.firestore
  .document('results/{resultID}')
  .onWrite((change, context) => {
    let promises = [];
    // Retrieve the current value
    const data = change.after.exists ? change.after.data() : null;
    const oldData = change.before.data();
    // delete result
    if (data === null) {
      oldData.scores.forEach((score) => {
        score.players.forEach((player) => {
          promises.push(firestore.doc(`stats/${player.id}`).update({
            won: admin.firestore.FieldValue.increment(score.won * -1),
            played: admin.firestore.FieldValue.increment(-1),
            sum: admin.firestore.FieldValue.increment(score.funkies * -1),
            gameIDs: admin.firestore.FieldValue.arrayUnion(oldData.gameID),
            [`games.${data.gameID}.won`]: admin.firestore.FieldValue.increment(score.won * -1),
            [`games.${data.gameID}.played`]: admin.firestore.FieldValue.increment(-1),
            [`games.${data.gameID}.sum`]: admin.firestore.FieldValue.increment(score.funkies * -1),
          }))
        })
      })
      return Promise.all(promises);
    }
    // create/update result
    const updatedData = updateResults(data);
    if (!updatedData) return null;
    updatedData.scores.forEach((score, i) => {
      score.players.forEach((player, j) => {
        promises.push(firestore.doc(`stats/${player.id}`).get())
      })
    })
    return Promise.all(promises)
      .then((snapshots) => {
        let promises = []
        snapshots.forEach((snapshot) => {
          const playerID = snapshot.id
          if (snapshot.exists) {
            updatedData.scores.forEach((score, i) => {
              score.players.forEach((player, j) => {
                if (player.id === playerID) {
                  const won = oldData ? score.won - oldData.scores[i].won : score.won
                  const funkies = oldData ? score.funkies - oldData.scores[i].score : score.funkies
                  promises.push(firestore.doc(`stats/${player.id}`).update({
                    won: admin.firestore.FieldValue.increment(won),
                    played: admin.firestore.FieldValue.increment(oldData ? 0 : 1),
                    sum: admin.firestore.FieldValue.increment(funkies),
                    gameIDs: admin.firestore.FieldValue.arrayUnion(data.gameID),
                    [`games.${data.gameID}.won`]: admin.firestore.FieldValue.increment(won),
                    [`games.${data.gameID}.played`]: admin.firestore.FieldValue.increment(oldData ? 0 : 1),
                    [`games.${data.gameID}.sum`]: admin.firestore.FieldValue.increment(funkies),
                  }))
                }
              })
            })
          }
          else {
            updatedData.scores.forEach((score, i) => {
              score.players.forEach((player, j) => {
                if (player.id === playerID) {
                  promises.push(firestore.doc(`stats/${player.id}`).set({
                    won: score.won,
                    played: 1,
                    sum: score.funkies,
                    gameIDs: admin.firestore.FieldValue.arrayUnion(data.gameID),
                    games: {
                      [data.gameID]: {
                        won: score.won,
                        played: 1,
                        sum: score.funkies,
                      },
                    },
                  }))
                }
              })
            })
          }
        })
        if (!oldData) {
          promises.push(firestore.doc(`ranking/${data.gameID}`)).set({played: firestore.FieldValue.increment(1)}, {merge: true})
        }
        return Promise.all(promises)
      })
      .then(() => {
        return change.after.ref.set(updatedData, {merge: true})
      });
  });

exports.updateStats = functions.firestore
  .document('stats/{playerID}')
  .onWrite((change, context) => {
    if (change.after.exists) {
      const data = change.after.data();
      const oldData = change.before.data();
      let updatedData = {}
      let promises = []
      if (!oldData || oldData.played !== data.played) {
        updatedData.avg = data.sum / data.played
        promises.push(firestore.doc(`ranking/all`).set({
          [context.params.playerID]: updatedData.avg
        }, {merge: true}))
      }
      Object.keys(data.games).forEach((gameID) => {
        if (!oldData || oldData.games[gameID].played !== data.games[gameID].played) {
          updatedData[`games.${gameID}.avg`] = data.games[gameID].sum / data.games[gameID].played
          promises.push(firestore.doc(`ranking/${gameID}`).set({
            [context.params.playerID]: updatedData.avg
          }, {merge: true}))
        }
      })
      if (Object.keys(updatedData).length > 0) {
        promises.push(change.after.ref.update(updatedData, {merge: true}))
      }
      if (promises.length > 0) {
        return Promise.all(promises)
      }
    }
    return null;
  })


/*
stats/playerid
{
  won: 0,
  played: 0,
  sum: 0,
  avg: 0,
  games: {
    game1: {
      won: 0,
      played: 0,
      sum: 0,
      avg: 0,
    }
  }
  gameIDs: [game1]
}

ranking/all
{
  playerID: avg,
}

ranking/gameID
{
  playerID: avg,
}

 */