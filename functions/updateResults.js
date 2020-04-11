const admin = require('firebase-admin')

const MIN_FUNKIES = 0.1

function updateResults(data, force = false) {
  // This is crucial to prevent infinite loops.
  if (!force && (!data || data.playerIDs)) return null;

  const origData = JSON.parse(JSON.stringify(data));
  const countPlayers = data.scores.reduce((acc, value) => acc + value.players.length, 0);
  let minScore = data.scores.reduce((acc, value) => (acc.score > value.score) ? value : acc);
  let normalizedScore = data.scores;
  // Increase score, so nobody has a negative value
  if (minScore.score < 0) {
    normalizedScore = data.scores.map((score) => {
      score.score += 2 * Math.abs(minScore.score)
      return score
    })
  }

  // Increase score if min score is below < 0.1
  minScore = normalizedScore.reduce((acc, value) => (acc.score > value.score) ? value : acc);
  const sumScore = normalizedScore.reduce((acc, value) => acc + value.score, 0);
  let minFunkies = countPlayers * minScore.score / minScore.players.length / sumScore;
  if (minFunkies <= MIN_FUNKIES) {
    let normalizeScore = ( (MIN_FUNKIES * minScore.players.length) * ( sumScore + data.scores.length * Math.abs(minScore.score)) ) / ( countPlayers - MIN_FUNKIES * minScore.players.length * data.scores.length)
    normalizeScore -= minScore.score
    normalizedScore = normalizedScore.map((score) => {
      score.score += normalizeScore
      return score
    })
  }

  let playerIDs = [];
  const sumScoreNormalized = normalizedScore.reduce((acc, value) => acc + value.score, 0);
  const max = normalizedScore.reduce((max, value) => (value.score > max.score) ? value : max)
  const scores = normalizedScore.map((score, index) => {
    score.funkies = countPlayers * score.score / score.players.length / sumScoreNormalized;
    score.players.forEach((player) => {
      playerIDs.push(player.id)
    })
    score.score = origData.scores[index].score
    score.won = (max.score === score.score) ? 1 : 0;
    return score
  })

  return {
    scores,
    playerIDs,
  }
}

function updateStatsFromResults (firestore, data, oldData, forceResultUpdate = false, forceStatsRankingUpdate = false, seasonPrefixes = []) {
  let promises = [];
  // delete result
  if (data === null) {
    seasonPrefixes.forEach((seasonPrefix) => {
      oldData.scores.forEach((score) => {
        score.players.forEach((player) => {
          promises.push(firestore.doc(`${seasonPrefix}/stats/${player.id}`).update({
            won: admin.firestore.FieldValue.increment(score.won * -1),
            played: admin.firestore.FieldValue.increment(-1),
            sum: admin.firestore.FieldValue.increment(score.funkies * -1),
            gameIDs: admin.firestore.FieldValue.arrayUnion(oldData.gameID),
            [`games.${oldData.gameID}.won`]: admin.firestore.FieldValue.increment(score.won * -1),
            [`games.${oldData.gameID}.played`]: admin.firestore.FieldValue.increment(-1),
            [`games.${oldData.gameID}.sum`]: admin.firestore.FieldValue.increment(score.funkies * -1),
          }))
        })
      })
    })
    return Promise.all(promises);
  }
  // create/update result
  let updatedData = null
  if (forceResultUpdate || !('playerIDs' in data)) {
    updatedData = updateResults(data, forceResultUpdate)
  }
  if (!updatedData && forceStatsRankingUpdate) {
    updatedData = data
  }
  if (!updatedData) return new Promise((resolve, reject) => resolve({}));
  seasonPrefixes.forEach((seasonPrefix) => {
    updatedData.scores.forEach((score, i) => {
      score.players.forEach((player, j) => {
        promises.push(firestore.doc(`${seasonPrefix}/stats/${player.id}`).get())
      })
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
                const won = oldData && oldData.scores[i].won ? score.won - oldData.scores[i].won : score.won
                const funkies = oldData && oldData.scores[i].funkies ? score.funkies - oldData.scores[i].funkies : score.funkies
                const newData = {
                  won: admin.firestore.FieldValue.increment(won),
                  played: admin.firestore.FieldValue.increment(oldData ? 0 : 1),
                  sum: admin.firestore.FieldValue.increment(funkies),
                  gameIDs: admin.firestore.FieldValue.arrayUnion(data.gameID),
                  [`games.${data.gameID}.won`]: admin.firestore.FieldValue.increment(won),
                  [`games.${data.gameID}.played`]: admin.firestore.FieldValue.increment(oldData ? 0 : 1),
                  [`games.${data.gameID}.sum`]: admin.firestore.FieldValue.increment(funkies),
                }
                promises.push(snapshot.ref.update(newData))
              }
            })
          })
        }
        else {
          updatedData.scores.forEach((score, i) => {
            score.players.forEach((player, j) => {
              if (player.id === playerID) {
                promises.push(snapshot.ref.set({
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
        seasonPrefixes.forEach((seasonPrefix) => {
          promises.push(firestore.doc(`${seasonPrefix}/ranking/all`).set({played: admin.firestore.FieldValue.increment(1)}, {merge: true}))
          promises.push(firestore.doc(`${seasonPrefix}/ranking/${data.gameID}`).set({played: admin.firestore.FieldValue.increment(1)}, {merge: true}))
        })
      }
      return Promise.all(promises)
    })
    .then(() => {
      return updatedData
    });
}


exports.updateResults = updateResults
exports.updateStatsFromResults = updateStatsFromResults