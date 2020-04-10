process.env.GOOGLE_APPLICATION_CREDENTIALS = 'account.json'
const admin = require('firebase-admin')
admin.initializeApp()
const firestore = admin.firestore()
const updateStatsFromResults = require('./updateResults').updateStatsFromResults
const seasonPrefix = 'season/spjNV8vZz7KfGZFbE2d2'
const forceUpdateFunkiesPerResult = false
const wait = forceUpdateFunkiesPerResult ? 1500 : 0

const DateFormat = new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  month: 'numeric',
  day: '2-digit',
})

deleteCollection(firestore, `${seasonPrefix}/ranking`, 10)
  .then(() => {
    return deleteCollection(firestore, `${seasonPrefix}/stats`, 10)
  })
  .then(() => {
    let collection = firestore.collection('results');
    collection = collection.where('date', '>=', new Date('2011-01-01'))
    collection = collection.where('date', '<', new Date('2013-01-01'))
    return collection.get()
  })
  .then((documents) => {
    let promises = [], i = 1
    documents.forEach((document) => {
      const updatedData = document.data()
      promises.push(new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(document.id)
        }, i * wait)
      })
        .then((id) => {
          console.log(id + ' from ' + DateFormat.format(updatedData.date.toDate()))
          return updateStatsFromResults(firestore, updatedData, null, forceUpdateFunkiesPerResult, true, seasonPrefix)
        })
        .then((updatedData) => {
          if (forceUpdateFunkiesPerResult) {
            return document.ref.set(updatedData, {merge: true})
          }
          else {
            return {write: false}
          }
        }))
      i++
    })
    return Promise.all(promises)
  })
  .then((results) => {
    results.forEach((writeResult) => {
      console.log(writeResult)
    })
    return
  })
  .catch((error) => {
    console.log(error)
  })

function deleteCollection (db, collectionPath, batchSize) {
  let collectionRef = db.collection(collectionPath)
  let query = collectionRef.orderBy('__name__').limit(batchSize)

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject)
  })
}

function deleteQueryBatch (db, query, batchSize, resolve, reject) {
  query.get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        return 0
      }

      // Delete documents in a batch
      let batch = db.batch()
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      return batch.commit().then(() => {
        return snapshot.size
      })
    })
    .then((numDeleted) => {
      if (numDeleted === 0) {
        resolve()
        return
      }
      // Recurse on the next process tick, to avoid
      // exploding the stack.
      process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize, resolve, reject)
      })
      return
    })
    .catch(reject)
}