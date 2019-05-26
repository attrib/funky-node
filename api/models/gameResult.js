const mongoose = require('mongoose')

let GameResultSchema = mongoose.Schema({
  game: {
    type: mongoose.Schema.ObjectId,
    ref: 'Game',
    required: true,
    index: true,
  },
  playedAt: {
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
  additionalInfo: {
    type: 'Mixed',
  },
  finished: {
    type: 'Boolean',
    default: true,
  },
  turns: [
    [
      {
        team: {
          name: {
            type: 'String',
          },
          users: [
            {
              type: mongoose.Schema.ObjectId,
              ref: 'Player',
              index: true,
            }
          ]
        },
        score: {
          type: 'Number',
          required: true
        },
        approvedBy: [
          {
            type: mongoose.Schema.ObjectId,
            ref: 'Player',
            index: true,
          }
        ]
      }
    ]
  ],
  finaleResult: [
    {
      team: {
        name: {
          type: 'String',
        },
        users: [
          {
            type: mongoose.Schema.ObjectId,
            ref: 'Player',
            index: true,
          }
        ]
      },
      score: {
        type: 'Number',
        required: true
      },
      approvedBy: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'Player',
          index: true,
        }
      ]
    }
  ]

}, {timestamps: true})

GameResultSchema.methods.toWeb = function () {
  let json = this.toJSON()
  //this is for the front end
  json.id = this._id
  delete json._id
  return json
}

module.exports = mongoose.model('GameResult', GameResultSchema)

