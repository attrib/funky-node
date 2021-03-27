# funky

Source code of http://funky.wtf

board and card game statistics for competitive gamers and statistic nerds.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

You will find some information on how to perform common tasks [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md).

## todos
 
* more filters
* Live Games
  * more widgets:
    * Chimera
    * Tichu  
    * Wizard?
* upload images / location
* pagination
* (WiP) Mobile support
* multiple players per user  
* better theming?
* better access control (allow editing own results, delete own results)
* delete games???
* more tags?
* password reset / email?


# local testing

    // Get database backup
    docker run --rm --volume=$HOME/neo4j/data:/data --volume=$HOME/neo4j/backup:/backup neo4j neo4j-admin dump --to=/backup/backup-neo4j.dump --database=neo4j
    // import database backup
    docker run --rm --volume=$HOME/neo4j/data:/data --volume=$HOME/neo4j/backup:/backup neo4j neo4j-admin load --from=/backup/backup-neo4j.dump --database=neo4j --force
    // start neo4j
    docker run --rm --publish=7474:7474 --publish=7687:7687 --volume=$HOME/neo4j/data:/data neo4j
    // start backend
    cd backend; npm run dev
    // start frontend
    npm start