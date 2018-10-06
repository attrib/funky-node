const {to} = require('await-to-js')
const pe = require('parse-error')

module.exports.to = async (promise) => {
  let err, res;
  [err, res] = await to(promise)
  if (err) return [pe(err)]

  return [null, res]
}

/**
 * Error Web Response
 *
 * @param res
 * @param err
 * @param code
 * @returns {any | Promise<any>}
 * @constructor
 */
module.exports.ReE = function (res, err, code) {
  res.setHeader('Content-Type', 'application/json')

  if (typeof err == 'object' && typeof err.message != 'undefined') {
    err = err.message
  }

  if (typeof code === 'undefined') code = 422
  res.statusCode = code

  return res.json({success: false, error: err})
}

/**
 * Success Web Response
 *
 * @param res
 * @param data
 * @param code
 * @returns {any | Promise<any>}
 * @constructor
 */
module.exports.ReS = function (res, data, code) {
  res.setHeader('Content-Type', 'application/json')
  let send_data = {success: true}

  if (typeof data == 'object') {
    send_data = Object.assign(data, send_data)//merge the objects
  }

  if (typeof code !== 'undefined') res.statusCode = code

  return res.json(send_data)
}

/**
 * Throw Error
 *
 * @type {TE}
 */
module.exports.TE = TE = function (err_message, log) {
  if (log === true) {
    console.error(err_message)
  }

  throw new Error(err_message)
}

