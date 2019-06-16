// Chai is a commonly used library for creating unit test suites. It is easily extended with plugins.
const chai = require('chai');
const assert = chai.assert;

describe('updateResults', () => {
  let updateResults;

  before(() => {
    // Now we can require index.js and save the exports inside a namespace called myFunctions.
    updateResults = require('../updateResults').updateResults;
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
    const result = updateResults(data)

    assert.lengthOf(result.playerIDs, 1)
    assert.include(result.playerIDs, "abcd")

    assert.lengthOf(result.scores, 1)
    assert.equal(result.scores[0].score, 1000)
    assert.equal(result.scores[0].funkies, 1)
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
    }, result;

    after(() => {
      assert.lengthOf(result.playerIDs, 2)
      assert.include(result.playerIDs, "player1")
      assert.include(result.playerIDs, "player2")

      // check score not changed
      assert.lengthOf(result.scores, 2)
      result.scores.forEach((score, index) => {
        assert.equal(score.score, data.scores[index].score)
      })
    })

    it('equal', () => {
      result = updateResults(data)
      assert.equal(result.scores[0].funkies, 1)
      assert.equal(result.scores[1].funkies, 1)
    })

    it('player 1 wins', () => {
      data.scores[0].score = 750;
      data.scores[1].score = 250;
      result = updateResults(data)
      assert.equal(result.scores[0].funkies, 1.5)
      assert.equal(result.scores[1].funkies, 0.5)
    })

    it('player 2 wins', () => {
      data.scores[0].score = 250;
      data.scores[1].score = 750;
      result = updateResults(data)
      assert.equal(result.scores[0].funkies, 0.5)
      assert.equal(result.scores[1].funkies, 1.5)
    })

    it('high win for player 2', () => {
      data.scores[0].score = 25;
      data.scores[1].score = 900;
      result = updateResults(data)
      assert.equal(Math.round(result.scores[0].funkies * 10) / 10, 0.1)
      assert.equal(Math.round(result.scores[1].funkies * 10) / 10, 1.9)
    })

    it('one negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = 750;
      result = updateResults(data)
      assert.equal(Math.round(result.scores[0].funkies * 10) / 10, 0.3)
      assert.equal(Math.round(result.scores[1].funkies * 10) / 10, 1.7)
    })

    it('all negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = -750;
      result = updateResults(data)
      assert.equal(result.scores[0].funkies, 1.25)
      assert.equal(result.scores[1].funkies, 0.75)
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
    }, result;

    after(() => {
      assert.lengthOf(result.playerIDs, 3)
      assert.include(result.playerIDs, "player1")
      assert.include(result.playerIDs, "player2")
      assert.include(result.playerIDs, "player3")

      // check score not changed
      assert.lengthOf(result.scores, 3)
      result.scores.forEach((score, index) => {
        assert.equal(score.score, data.scores[index].score)
      })
    })

    it('equal', () => {
      result = updateResults(data)
      assert.equal(result.scores[0].funkies, 1)
      assert.equal(result.scores[1].funkies, 1)
      assert.equal(result.scores[2].funkies, 1)
    })

    it('high win for player 2', () => {
      data.scores[0].score = 0;
      data.scores[1].score = 900;
      data.scores[1].score = 100;
      result = updateResults(data)
      assert.equal(Math.round(result.scores[0].funkies * 10) / 10, 0.1)
      assert.equal(Math.round(result.scores[1].funkies * 10) / 10, 0.3)
      assert.equal(Math.round(result.scores[2].funkies * 10) / 10, 2.6)
    })

    it('one negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = 750;
      data.scores[2].score = 500;
      result = updateResults(data)
      assert.equal(Math.round(result.scores[0].funkies * 10) / 10, 0.3)
      assert.equal(Math.round(result.scores[1].funkies * 10) / 10, 1.5)
      assert.equal(Math.round(result.scores[2].funkies * 10) / 10, 1.2)
    })

    it('all negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = -500;
      data.scores[2].score = -750;
      result = updateResults(data)
      assert.equal(result.scores[0].funkies, 1.25)
      assert.equal(result.scores[1].funkies, 1)
      assert.equal(result.scores[2].funkies, 0.75)
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
    }, result;

    after(() => {
      assert.lengthOf(result.playerIDs, 4)
      assert.include(result.playerIDs, "player1")
      assert.include(result.playerIDs, "player2")
      assert.include(result.playerIDs, "player3")
      assert.include(result.playerIDs, "player4")

      // check score not changed
      assert.lengthOf(result.scores, 2)
      result.scores.forEach((score, index) => {
        assert.equal(score.score, data.scores[index].score)
      })
    })

    it('equal', () => {
      result = updateResults(data)
      assert.equal(result.scores[0].funkies, 1)
      assert.equal(result.scores[1].funkies, 1)
    })

    it('high win for team 2', () => {
      data.scores[0].score = 0;
      data.scores[1].score = 900;
      result = updateResults(data)
      assert.equal(Math.round(result.scores[0].funkies * 10) / 10, 0.1)
      assert.equal(Math.round(result.scores[1].funkies * 10) / 10, 1.9)
    })

    it('one negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = 750;
      result = updateResults(data)
      assert.equal(Math.round(result.scores[0].funkies * 10) / 10, 0.3)
      assert.equal(Math.round(result.scores[1].funkies * 10) / 10, 1.7)
    })

    it('all negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = -500;
      result = updateResults(data)
      assert.equal(Math.round(result.scores[0].funkies * 10) / 10, 1.2)
      assert.equal(Math.round(result.scores[1].funkies * 10) / 10, 0.8)
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
    }, result;

    after(() => {
      assert.lengthOf(result.playerIDs, 3)
      assert.include(result.playerIDs, "player1")
      assert.include(result.playerIDs, "player2")
      assert.include(result.playerIDs, "player3")

      // check score not changed
      assert.lengthOf(result.scores, 2)
      result.scores.forEach((score, index) => {
        assert.equal(score.score, data.scores[index].score)
      })
    })

    it('equal', () => {
      result = updateResults(data)
      // if one alone wins with equal score against two players, the player "won"
      assert.equal(result.scores[0].funkies, 0.75)
      assert.equal(result.scores[1].funkies, 1.5)
    })

    it('high win for team 1', () => {
      data.scores[0].score = 0;
      data.scores[1].score = 900;
      result = updateResults(data)
      assert.equal(Math.round(result.scores[0].funkies * 10) / 10, 0.1)
      assert.equal(Math.round(result.scores[1].funkies * 10) / 10, 2.8)
    })

    it('high win for team 2', () => {
      data.scores[0].score = 900;
      data.scores[1].score = 0;
      result = updateResults(data)
      assert.equal(Math.round(result.scores[0].funkies * 100) / 100, 1.45)
      assert.equal(Math.round(result.scores[1].funkies * 10) / 10, 0.1)
    })

    it('one negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = 750;
      result = updateResults(data)
      assert.equal(Math.round(result.scores[0].funkies * 100) / 100, 0.25)
      assert.equal(Math.round(result.scores[1].funkies * 10) / 10, 2.5)
    })

    it('all negative score', () => {
      data.scores[0].score = -250;
      data.scores[1].score = -500;
      result = updateResults(data)
      assert.equal(Math.round(result.scores[0].funkies * 10) / 10, 0.9)
      assert.equal(Math.round(result.scores[1].funkies * 10) / 10, 1.2)
    })

  })

})