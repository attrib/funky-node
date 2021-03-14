const neo4j = require('neo4j-driver')
const uri = "neo4j://localhost", user = "neo4j", password = "test";
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

function convertTypes(value) {
  if (value instanceof neo4j.types.Node) {
    value = {
      id: value.identity,
      ...value.properties
    }
    Object.keys(value).forEach((key) => {
      value[key] = convertTypes(value[key])
    })
    return value
  }
  if (value instanceof neo4j.types.Integer) {
    return value.toInt()
  }
  if (value instanceof neo4j.types.Date) {
    return value.toString()
  }
  if (value instanceof neo4j.types.DateTime) {
    return value.toString()
  }
  if (Array.isArray(value)) {
    return value.map(value => convertTypes(value))
  }
  return value
}

/**
 *
 * @param {Response} response
 * @param {string} query
 * @param {object} parameter
 * @returns {Promise<array>}
 */
async function runQuery(response, query, parameter = {}) {
  const session = driver.session()
  return session.run(query, parameter).then((result) => {
    return result.records.map((record) => {
      const entry = {}
      record.keys.forEach((key) => {
        entry[key] = convertTypes(record.get(key))
      })
      return entry
    })
  }, (err) => {
    console.log(err)
    response.status(500);
    response.send({error: err})
  })
    .catch((err) => {
      console.log(err)
      response.status(500);
      response.send({error: err})
    })
    .finally(() => {
      session.close();
    })
}

module.exports.runQuery = runQuery
