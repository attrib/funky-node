const mongoose = require('mongoose')

let ResultSchema = mongoose.Schema({
  game: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game',
    required: true,
    index: true,
  },
  date: {
    type: 'Date',
    required: true
  },
  duration: {
    type: 'Number',
    min: 0
  },
  location: {
    type: 'String',
    trim: true
  },
  data: {
    type: 'Mixed'
  },
  results: [
    {
      team: {
        name: {
          type: 'String',
        },
        users: [
          {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            index: true,
          }
        ]
      },
      score: {
        type: 'Number',
        required: true
      }
    }
  ]
}, {timestamps: true})

ResultSchema.methods.toWeb = function () {
  let json = this.toJSON()
  //this is for the front end
  json.id = this._id
  delete json._id
  return json
}

module.exports = mongoose.model('Result', ResultSchema)

