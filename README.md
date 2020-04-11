# funky-clan

Source code of http://www.funky-clan.de

board and card game statistics for competitive gamers and statistic nerds.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

You will find some information on how to perform common tasks [here](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md).

## todos

* (WiP) Live Games
* upload images / location
* pagination
* (WiP) Mobile support


# local testing

    export GOOGLE_APPLICATION_CREDENTIALS=`pwd`/functions/account.json
    firebase emulators:start #--import=./dir
    
    node functions/test/create_testdata.js