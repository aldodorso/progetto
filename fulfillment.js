
//'use strict';


const functions = require('firebase-functions');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');
const axios = require('axios');



process.env.DEBUG = 'dialogflow:debug';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function welcome(agent) {
        agent.add(`Salve!`);
    }

    function fallback(agent) {
        agent.add(`Non capisco, puoi ripetere?`);
    }

    function getIstat(comune) {
        var mongoclient = require('mongodb').MongoClient;
        var uri = 'mongodb+srv://usr:<password>@cluster-suzvw.mongodb.net/test?retryWrites=true&w=majority';
        mongoclient.connect(uri, { useNewUrlParser: true }, (err, client) => {
            if (err) {
                agent.add(``);
            }
            else {
                const collection = client.db("comuni").collection("collection");
                collection.findOne({ "nome ": '"' + comune + '"' }, (errore, result) => {
                    if (errore) console.log(errore);
                    else {
                        return result.codice.slice(1);
                    }
                });
            }
        });
    }


    function getMeteo(agent) {
        var citta = agent.parameters.address;
        var istatCode = "";
        istatCode = getIstat(citta);
        var product = "wrf5";
        const URL = 'http://193.205.230.6/products/' + product + '/forecast/';

        if (istatCode === "") {
            const hardcoded = "com63049"; // si deve ottenere convertendo citta in code
            return axios.get(URL + hardcoded)
                .then((result) => {
                    agent.add(`il tempo a ` + citta + ` al momento e ` +
                        result.data.forecast.text.it + ` ,con un vento che soffia da ` +
                        result.data.forecast.winds);
                });
        }
        else {
            agent.add(`Il codicice comune di ${citta} dovrebbe e ${istatCode} `);
            var citycode = "com" + istatCode;
            return axios.get(URL + citycode)
                .then((result) => {
                    agent.add(`il tempo a ` + citta + ` al momento e ` +
                        result.data.forecast.text.it + ` ,con un vento che soffia da ` +
                        result.data.forecast.winds);
                });

        }
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('weather', getMeteo);
    agent.handleRequest(intentMap);

});
