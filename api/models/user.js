const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const bcrypt_p = require('bcrypt-promise')
const jwt = require('jsonwebtoken')
const {Result} = require('./index')
const validate = require('mongoose-validator')
const {TE, to} = require('../services/util')
const Roles = require('./roles')
const CONFIG = require('../config/config')

let UserSchema = mongoose.Schema({
  nickname: {
    type: String,
    unique: true,
    sparse: true, //sparse is because now we have two possible unique keys that are optional
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    index: true,
    unique: true,
    sparse: true,
    validate: [validate({
      validator: 'isEmail',
      message: 'Not a valid email.',
    })]
  },
  password: {
    type: String
  },
  steamProfile: {
    type: String,
    trim: true,
    validate: [validate({
      validator: 'isURL',
      message: 'Not a valid url.',
      arguments: [{host_whitelist: ['steamcommunity.com']}],
    })]
  },
  roles: [
    {
      type: String,
      enum: [Roles.ADMIN, Roles.VERIFIED],
    }
  ]
}, {timestamps: true})

UserSchema.virtual('results', {
  ref: 'Result',
  localField: '_id',
  foreignField: 'users.user',
  justOne: false,
})

UserSchema.pre('save', async function (next) {

  if (this.isModified('password') || this.isNew) {

    let err, salt, hash;
    [err, salt] = await to(bcrypt.genSalt(10))
    if (err) TE(err.message, true);

    [err, hash] = await to(bcrypt.hash(this.password, salt))
    if (err) TE(err.message, true)

    this.password = hash

  } else {
    return next()
  }
})

UserSchema.methods.comparePassword = async function (pw) {
  let err, pass
  if (!this.password) TE('password not set');

  [err, pass] = await to(bcrypt_p.compare(pw, this.password))
  if (err) TE(err)

  if (!pass) TE('invalid password')

  return this
}

UserSchema.methods.Results = async function () {
  let err, results;
  [err, results] = await to(Result.find({'users.user': this._id}))
  if (err) TE('err getting companies')
  return results
}


UserSchema.methods.getJWT = function () {
  let expiration_time = parseInt(CONFIG.jwt_expiration)
  return 'Bearer ' + jwt.sign({user_id: this._id}, CONFIG.jwt_encryption, {expiresIn: expiration_time})
}

UserSchema.methods.toWeb = function () {
  let json = this.toJSON()
  //this is for the front end
  json.id = this._id
  json.password = true
  delete json._id
  return json
}

/**
 * Check if user has role
 *
 * @param role
 * @returns {boolean}
 */
UserSchema.methods.hasRole = function (role) {
  return this.roles.includes(role);
}

module.exports = mongoose.model('User', UserSchema)


