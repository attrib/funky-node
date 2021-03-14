# funky-clan

Source code of http://www.funky-clan.de

board and card game statistics for competitive gamers and statistic nerds.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

You will find some information on how to perform common tasks [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md).

## todos

* edit results
* ranking widget create/edit bug
* deploy neo4j live + add backup
* import data (add author to results? add news)
* news entry (rewrite with neo4j)  
* more filters
* scores by team  
* (WiP) Live Games
* delete result  
* upload images / location
* pagination
* (WiP) Mobile support
* multiple players per user  
* better theming?
* better access control (allow editing own results, delete own results)
* delete games???
* more tags?


# local testing

    export GOOGLE_APPLICATION_CREDENTIALS=`pwd`/functions/account.json
    firebase emulators:start #--import=./dir
    
    node functions/test/create_testdata.js