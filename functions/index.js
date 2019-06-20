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
    return updateStatsFromResults(firestore, data, oldData)
      .then((updatedData) => {
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
      if (!oldData || oldData.played !== data.played || oldData.sum !== data.sum) {
        updatedData.avg = data.sum / data.played
        promises.push(firestore.doc(`ranking/all`).set({
          [context.params.playerID]: updatedData.avg
        }, {merge: true}))
      }
      Object.keys(data.games).forEach((gameID) => {
        if (!oldData || !oldData.games || !oldData.games[gameID] || oldData.games[gameID].played !== data.games[gameID].played || oldData.games[gameID].sum !== data.games[gameID].sum) {
          updatedData[`games.${gameID}.avg`] = data.games[gameID].sum / data.games[gameID].played
          promises.push(firestore.doc(`ranking/${gameID}`).set({
            [context.params.playerID]: data.games[gameID].sum / data.games[gameID].played
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