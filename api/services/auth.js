const {User} = require('../models')
const validator = require('validator')
const {to, TE} = require('./util')

/**
 * Create user
 *
 * @param userInfo
 * @returns {Promise<*>}
 */
const createUser = async function (userInfo) {
  let user, err

  [err, user] = await to(User.create(userInfo))
  if (err) TE(err)

  return user
}
module.exports.createUser = createUser

/**
 * Authenticate a user.
 *
 * @param userInfo
 * @returns {Promise<*>}
 */
const authUser = async function (userInfo) {//returns token
  let err, user

  if (!userInfo.name) TE('Please enter a nickname or email to login')
  if (!userInfo.password) TE('Please enter a password to login')

  if (validator.isEmail(userInfo.name)) {
    [err, user] = await to(User.findOne({email: userInfo.name}))
    if (err) TE(err.message)

  } else {
    [err, user] = await to(User.findOne({nickname: userInfo.name}))
    if (err) TE(err.message)
  }

  if (!user) TE('Not registered');

  [err, user] = await to(user.comparePassword(userInfo.password))

  if (err) TE(err.message)

  return user

}
module.exports.authUser = authUser