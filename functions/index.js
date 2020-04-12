const functions = require('firebase-functions')
const md = require('markdown-it')();
const updateStatsFromResults = require('./updateResults').updateStatsFromResults
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
    // Retrieve the current value
    const data = change.after.exists ? change.after.data() : null;
    const oldData = change.before.data();
    const date = data ? data.date : oldData.date;

    return firestore.collection('season')
      .where('endDate', '>=', date)
      .get()
      .then((documents) => {
        let docs = []
        documents.forEach((document) => {
          const docData = document.data()
          if (docData.startDate <= date) {
            docs.push(document.id)
          }
        })
        return docs
      })
      .then((seasonIds) => {
        seasonIds = seasonIds.map((seasonId) => {
          return `season/${seasonId}`
        })
        // all season
        seasonIds.push('');
        return updateStatsFromResults(firestore, data, oldData, false, false, seasonIds)
      })
      .then((updatedData) => {
        return change.after.ref.set(updatedData, {merge: true})
      })
  });

exports.updateStats = functions.firestore
  .document('stats/{playerID}')
  .onWrite((change, context) => {
    return updateStats(change, context, '')
  })

exports.updateSeasonStats = functions.firestore
  .document('season/{seasonID}/stats/{playerID}')
  .onWrite((change, context) => {
    return updateStats(change, context, 'season/' + context.params.seasonID)
  })

function updateStats(change, context, seasonPrefix)  {
  if (change.after.exists) {
    const data = change.after.data();
    const oldData = change.before.data();
    let updatedData = {}
    let promises = []
    if (!oldData || oldData.played !== data.played || oldData.sum !== data.sum || !data.avg || Math.round(data.avg * 1000) !== Math.round(data.sum / data.played * 1000)) {
      updatedData.avg = data.sum / data.played
      promises.push(firestore.doc(`${seasonPrefix}/ranking/all`).set({
        [context.params.playerID]: updatedData.avg
      }, {merge: true}))
    }
    Object.keys(data.games).forEach((gameID) => {
      if (!oldData || !oldData.games || !oldData.games[gameID] || oldData.games[gameID].played !== data.games[gameID].played || oldData.games[gameID].sum !== data.games[gameID].sum || !data.games[gameID].avg || Math.round(data.games[gameID].avg * 1000) !== Math.round(data.games[gameID].sum / data.games[gameID].played * 1000)) {
        updatedData[`games.${gameID}.avg`] = data.games[gameID].sum / data.games[gameID].played
        promises.push(firestore.doc(`${seasonPrefix}/ranking/${gameID}`).set({
          [context.params.playerID]: data.games[gameID].sum / data.games[gameID].played
        }, {merge: true}))
      }
    })
    if (Object.keys(updatedData).length > 0) {
      promises.push(change.after.ref.update(updatedData))
    }
    if (promises.length > 0) {
      return Promise.all(promises)
    }
  }
  return null;
}

exports.createLiveGames = functions.firestore
  .document('liveGames/{liveGameID}')
  .onCreate((doc, context) => {
    const data = doc.data()
    let updatedData = {
      playerIDs: [],
      lastUpdatedDate: admin.firestore.FieldValue.serverTimestamp(),
    }
    data.scores.forEach((score) => {
      score.players.forEach((player) => {
        updatedData.playerIDs.push(player.id)
      })
    })
    return doc.ref.set(updatedData, {merge: true})
  })

exports.updateLiveGames = functions.firestore
  .document('liveGames/{liveGameID}')
  .onUpdate((change, context) => {
    const data = change.after.data()
    if (!data.playerIDs) {
      let updatedData = {
        playerIDs: [],
        lastUpdatedDate: admin.firestore.FieldValue.serverTimestamp(),
      }

      data.scores.forEach((score) => {
        score.players.forEach((player) => {
          updatedData.playerIDs.push(player.id)
        })
      })

      return change.after.ref.set(updatedData, {merge: true})
    }
    return null
  })