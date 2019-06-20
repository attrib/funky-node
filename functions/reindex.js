process.env.GOOGLE_APPLICATION_CREDENTIALS = 'account.json'
const admin = require('firebase-admin')
admin.initializeApp()
const firestore = admin.firestore()
const updateStatsFromResults = require('./updateResults').updateStatsFromResults

deleteCollection(firestore, 'ranking', 10)
  .then(() => {
    return deleteCollection(firestore, 'stats', 10)
  })
  .then(() => {
    return firestore.collection('results').get()
  })
  .then((documents) => {
    let promises = [], i = 1
    documents.forEach((document) => {
      const updatedData = document.data()
      promises.push(new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve(document.id)
        }, i * 5000)
      })
        .then((id) => {
          console.log(id)
          return updateStatsFromResults(firestore, updatedData, null, true)
        })
        .then((updatedData) => {
          return document.ref.set(updatedData, {merge: true})
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