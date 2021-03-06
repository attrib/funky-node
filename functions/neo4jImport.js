const neo4j = require('neo4j-driver')
const crypto = require('crypto');
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'account.json'
const admin = require('firebase-admin')
admin.initializeApp()
const firestore = admin.firestore()

// wsl2: docker run --publish=7474:7474 --publish=7687:7687 --volume=$HOME/neo4j/data:/data neo4j
const uri = "neo4j://localhost", user="neo4j", password="test";

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))
const session = driver.session()

let firestorePromises = [];
firestorePromises.push(firestore.collection('players').get()
    .then((documents) => {
        let players = {}
        documents.forEach((document) => {
            players[document.id] = document.data();
        });
        return players;
    }))
firestorePromises.push(firestore.collection('games').get()
    .then((documents) => {
        let games = {}
        documents.forEach((document) => {
            games[document.id] = document.data();
        });
        return games;
    }))
firestorePromises.push(firestore.collection('results').get()
    .then((documents) => {
        let results = {}
        documents.forEach((document) => {
            results[document.id] = document.data();
        });
        return results;
    }))
firestorePromises.push(firestore.collection('season').get()
    .then((documents) => {
        let seasons = {}
        documents.forEach((document) => {
            seasons[document.id] = document.data();
        });
        return seasons;
    }))

const txc = session.beginTransaction();

Promise.all(firestorePromises)
    .then(([players, games, results, seasons]) => {
        let promises = [players, games, results, seasons];

        console.log('Fetched DB');

        // delete all first
        promises.push('MATCH (n) DETACH DELETE n');

        Object.values(games).forEach((game) => {
            promises.push(txc.run('CREATE (a:Game {name: $name, description: $description, description_markdown: $markdown})', { name: game.name, description: game.description, markdown: game.description_markdown}));
        });

        return Promise.all(promises)
    })
    .then(([players, games, results, seasons, ...data]) => {
        console.log('Start creating queries');
        let promises = [];
        Object.values(results).forEach((result) => {
            const resultDate = result.date.toDate();
            let parameter = {game: games[result.gameID].name, date: resultDate.toISOString(), note: result.notes};

            let scoreIndex = 0, playerIndex = 0;
            let creates = ['(game)<-[rg:GAME]-(result:Result {date: datetime($date), notes: $note})'],
                merge = ['(game:Game {name: $game})'];

            let seasonIndex = 0;
            Object.values(seasons).forEach((season) => {
                if (resultDate > season.startDate.toDate() && season.endDate.toDate() > resultDate) {
                    merge.push(`(season${seasonIndex}:Tag {name: $season${seasonIndex}})`);
                    creates.push(`(season${seasonIndex})<-[rt${seasonIndex}:TAG]-(result)`);
                    parameter['season' + seasonIndex] = 'Season ' + season.name;
                    seasonIndex++;
                }
            });

            result.scores.forEach((score) => {
                parameter['score' + scoreIndex] = score.score;
                parameter['funkies' + scoreIndex] = score.funkies;
                parameter['won' + scoreIndex] = score.won;
                let team = [],
                    hash = crypto.createHash('md5');
                score.players.forEach((player) => {
                    team.push(players[player.id].nick);
                })
                team.sort()
                team.forEach(player => hash.update(player))
                hash = hash.digest('hex');
                merge.push(`(team${scoreIndex}:Team {hash: $teamHash${scoreIndex}})`)
                parameter['teamHash' + scoreIndex] = hash;
                team.forEach((player) => {
                    merge.push(`(player${playerIndex}:Player {nick: $player${playerIndex}})`)
                    parameter['player' + playerIndex] = player;
                    merge.push(`(player${playerIndex})-[:MEMBER]->(team${scoreIndex})`)
                    playerIndex++;
                })

                creates.push(`(team${scoreIndex})-[rs${scoreIndex}:SCORED {score: $score${scoreIndex}, funkies: $funkies${scoreIndex}, won: $won${scoreIndex}}]->(result)`);
                scoreIndex++;
            });

            let query = 'MERGE ' + merge.join('\n MERGE ') +  '\n CREATE ' + creates.join(',\n');
            //console.log(query, parameter)
            promises.push(txc.run(query, parameter))
        })
        console.log('Creating');
        return Promise.all(promises)
    })
    .then((results) => {
        console.log('Committing');
        return txc.commit();
    })
    .then(() => {
        console.log('Finished');
        return true;
    })
    .catch((error) => {
        console.log(error)
        txc.rollback();
    })
    .finally(() => {
        // on application exit:
        return session.close().then(() => {
            return driver.close()
        })
    })