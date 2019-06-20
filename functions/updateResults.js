const MIN_FUNKIES = 0.1

exports.updateResults = function (data) {
  // This is crucial to prevent infinite loops.
  if (!data || data.playerIDs) return null;

  const origData = JSON.parse(JSON.stringify(data));
  const countPlayers = data.scores.reduce((acc, value) => acc + value.players.length, 0);
  let minScore = data.scores.reduce((acc, value) => (acc.score > value.score) ? value : acc);
  let normalizedScore = data.scores;
  // Increase score, so nobody has a negative value
  if (minScore.score < 0) {
    normalizedScore = data.scores.map((score) => {
      score.score += 2 * Math.abs(minScore.score)
      return score
    })
  }

  // Increase score if min score is below < 0.1
  minScore = normalizedScore.reduce((acc, value) => (acc.score > value.score) ? value : acc);
  const sumScore = normalizedScore.reduce((acc, value) => acc + value.score, 0);
  let minFunkies = countPlayers * minScore.score / minScore.players.length / sumScore;
  if (minFunkies <= MIN_FUNKIES) {
    let normalizeScore = ( (MIN_FUNKIES * minScore.players.length) * ( sumScore + data.scores.length * Math.abs(minScore.score)) ) / ( countPlayers - MIN_FUNKIES * minScore.players.length * data.scores.length)
    normalizeScore -= minScore.score
    normalizedScore = normalizedScore.map((score) => {
      score.score += normalizeScore
      return score
    })
  }

  let playerIDs = [];
  const sumScoreNormalized = normalizedScore.reduce((acc, value) => acc + value.score, 0);
  const max = normalizedScore.reduce((max, value) => (value.score > max.score) ? value : max)
  const scores = normalizedScore.map((score, index) => {
    score.funkies = countPlayers * score.score / score.players.length / sumScoreNormalized;
    score.players.forEach((player) => {
      playerIDs.push(player.id)
    })
    score.score = origData.scores[index].score
    score.won = (max.score === score.score) ? 1 : 0;
    return score
  })

  return {
    scores,
    playerIDs,
  }
}