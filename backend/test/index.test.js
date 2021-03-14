// Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.
const chai = require('chai');
const assert = chai.assert;

describe('updateResults', () => {
  let updateResults;

  before(() => {
    // Now we can require index.js and save the exports inside a namespace called myFunctions.
    updateResults = require('../routes/result').calcScore;
  });

  it('single player', () => {
    const data = {
      scores: [
        {
          score: 1000,
          players: [
            {id: 'abcd'}
          ]
        }
      ]
    }
    const scores = updateResults(JSON.parse(JSON.stringify(data)))

    assert.lengthOf(scores, 1)
    assert.equal(scores[0].score, 1000)
    assert.equal(scores[0].funkies, 1)
  })

  describe('1v1', () => {
    let data = {
      scores: [
        {
          score: 1000,
          players: [
            {id: 'player1'}
          ]
        },
        {
          score: 1000,
          players: [
            {id: 'player2'}
          ]
        }
      ]
    }, scores;

    afterEach(() => {
      // check score not changed
      assert.lengthOf(scores, 2)
      scores.forEach((score, index) => {
        assert.equal(score.score, data.scores[index].score)
      })
    })

    it('equal', () => {
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(scores[0].funkies, 1)
      assert.equal(scores[1].funkies, 1)
      assert.equal(scores[0].won, 1)
      assert.equal(scores[1].won, 1)
    })

    it('player 1 wins', () => {
      data.scores[0].score = 750;
      data.scores[1].score = 250;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(scores[0].funkies, 1.5)
      assert.equal(scores[1].funkies, 0.5)
      assert.equal(scores[0].won, 1)
      assert.equal(scores[1].won, 0)
    })

    it('player 2 wins', () => {
      data.scores[0].score = 250;
      data.scores[1].score = 750;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(scores[0].funkies, 0.5)
      assert.equal(scores[1].funkies, 1.5)
      assert.equal(scores[0].won, 0)
      assert.equal(scores[1].won, 1)
    })

    it('high win for player 2', () => {
      data.scores[0].score = 25;
      data.scores[1].score = 900;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(Math.round(scores[0].funkies * 10) / 10, 0.1)
      assert.equal(Math.round(scores[1].funkies * 10) / 10, 1.9)
      assert.equal(scores[0].won, 0)
      assert.equal(scores[1].won, 1)
    })

    it('one negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = 750;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(Math.round(scores[0].funkies * 10) / 10, 0.3)
      assert.equal(Math.round(scores[1].funkies * 10) / 10, 1.7)
      assert.equal(scores[0].won, 0)
      assert.equal(scores[1].won, 1)
    })

    it('all negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = -750;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(scores[0].funkies, 1.25)
      assert.equal(scores[1].funkies, 0.75)
      assert.equal(scores[0].won, 1)
      assert.equal(scores[1].won, 0)
    })
  })

  describe('1v1v1', () => {
    let data = {
      scores: [
        {
          score: 1000,
          players: [
            {id: 'player1'}
          ]
        },
        {
          score: 1000,
          players: [
            {id: 'player2'}
          ]
        },
        {
          score: 1000,
          players: [
            {id: 'player3'}
          ]
        }
      ]
    }, scores;

    afterEach(() => {
      // check score not changed
      assert.lengthOf(scores, 3)
      scores.forEach((score, index) => {
        assert.equal(score.score, data.scores[index].score)
      })
    })

    it('equal', () => {
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(scores[0].funkies, 1)
      assert.equal(scores[1].funkies, 1)
      assert.equal(scores[2].funkies, 1)
      assert.equal(scores[0].won, 1)
      assert.equal(scores[1].won, 1)
      assert.equal(scores[2].won, 1)
    })

    it('high win for player 2', () => {
      data.scores[0].score = 0;
      data.scores[1].score = 900;
      data.scores[1].score = 100;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(Math.round(scores[0].funkies * 10) / 10, 0.1)
      assert.equal(Math.round(scores[1].funkies * 10) / 10, 0.3)
      assert.equal(Math.round(scores[2].funkies * 10) / 10, 2.6)
      assert.equal(scores[0].won, 0)
      assert.equal(scores[1].won, 0)
      assert.equal(scores[2].won, 1)
    })

    it('one negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = 750;
      data.scores[2].score = 500;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(Math.round(scores[0].funkies * 10) / 10, 0.3)
      assert.equal(Math.round(scores[1].funkies * 10) / 10, 1.5)
      assert.equal(Math.round(scores[2].funkies * 10) / 10, 1.2)
      assert.equal(scores[0].won, 0)
      assert.equal(scores[1].won, 1)
      assert.equal(scores[2].won, 0)

    })

    it('all negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = -500;
      data.scores[2].score = -750;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(scores[0].funkies, 1.25)
      assert.equal(scores[1].funkies, 1)
      assert.equal(scores[2].funkies, 0.75)
      assert.equal(scores[0].won, 1)
      assert.equal(scores[1].won, 0)
      assert.equal(scores[2].won, 0)
    })
  })

  describe('2v2', () => {
    let data = {
      scores: [
        {
          score: 1000,
          players: [
            {id: 'player1'},
            {id: 'player3'}
          ]
        },
        {
          score: 1000,
          players: [
            {id: 'player2'},
            {id: 'player4'}
          ]
        }
      ]
    }, scores;

    afterEach(() => {
      // check score not changed
      assert.lengthOf(scores, 2)
      scores.forEach((score, index) => {
        assert.equal(score.score, data.scores[index].score)
      })
    })

    it('equal', () => {
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(scores[0].funkies, 1)
      assert.equal(scores[1].funkies, 1)
      assert.equal(scores[0].won, 1)
      assert.equal(scores[1].won, 1)
    })

    it('high win for team 2', () => {
      data.scores[0].score = 0;
      data.scores[1].score = 900;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(Math.round(scores[0].funkies * 10) / 10, 0.1)
      assert.equal(Math.round(scores[1].funkies * 10) / 10, 1.9)
      assert.equal(scores[0].won, 0)
      assert.equal(scores[1].won, 1)
    })

    it('one negative score', () => {
      data.scores[0].score = -260;
      data.scores[1].score = 1060;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(Math.round(scores[0].funkies * 10) / 10, 0.3)
      assert.equal(Math.round(scores[1].funkies * 10) / 10, 1.7)
      assert.equal(scores[0].won, 0)
      assert.equal(scores[1].won, 1)
    })

    it('all negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = -500;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(Math.round(scores[0].funkies * 10) / 10, 1.2)
      assert.equal(Math.round(scores[1].funkies * 10) / 10, 0.8)
      assert.equal(scores[0].won, 1)
      assert.equal(scores[1].won, 0)
    })

  })

  describe('2v1', () => {
    let data = {
      scores: [
        {
          score: 1000,
          players: [
            {id: 'player1'},
            {id: 'player3'}
          ]
        },
        {
          score: 1000,
          players: [
            {id: 'player2'},
          ]
        }
      ]
    }, scores;

    afterEach(() => {
      // check score not changed
      assert.lengthOf(scores, 2)
      scores.forEach((score, index) => {
        assert.equal(score.score, data.scores[index].score)
      })
    })

    it('equal', () => {
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      // if one alone wins with equal score against two players, the player "won"
      assert.equal(scores[0].funkies, 0.75)
      assert.equal(scores[1].funkies, 1.5)
      assert.equal(scores[0].won, 1)
      assert.equal(scores[1].won, 1)
    })

    it('high win for team 1', () => {
      data.scores[0].score = 0;
      data.scores[1].score = 900;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(Math.round(scores[0].funkies * 10) / 10, 0.1)
      assert.equal(Math.round(scores[1].funkies * 10) / 10, 2.8)
      assert.equal(scores[0].won, 0)
      assert.equal(scores[1].won, 1)
    })

    it('high win for team 2', () => {
      data.scores[0].score = 900;
      data.scores[1].score = 0;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(Math.round(scores[0].funkies * 100) / 100, 1.45)
      assert.equal(Math.round(scores[1].funkies * 10) / 10, 0.1)
      assert.equal(scores[0].won, 1)
      assert.equal(scores[1].won, 0)
    })

    it('one negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = 750;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(Math.round(scores[0].funkies * 100) / 100, 0.25)
      assert.equal(Math.round(scores[1].funkies * 10) / 10, 2.5)
      assert.equal(scores[0].won, 0)
      assert.equal(scores[1].won, 1)
    })

    it('all negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = -500;
      scores = updateResults(JSON.parse(JSON.stringify(data)))
      assert.equal(Math.round(scores[0].funkies * 10) / 10, 0.9)
      assert.equal(Math.round(scores[1].funkies * 10) / 10, 1.2)
      assert.equal(scores[0].won, 1)
      assert.equal(scores[1].won, 0)
    })

  })

})