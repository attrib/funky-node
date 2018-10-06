const mongoose = require('mongoose')

let GameSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
}, {timestamps: true})

GameSchema.methods.toWeb = function () {
  let json = this.toJSON()
  //this is for the front end
  json.id = this._id
  delete json._id
  return json
}

module.exports = mongoose.model('Game', GameSchema)

