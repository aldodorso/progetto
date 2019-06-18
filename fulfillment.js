
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

function getMeteo(agent) {

    var citta = agent.parameters.address.replace("/ /g","%20");
    const ISTAT = 'https://api.meteo.uniparthenope.it/places/search/byname/comune%20di%20';
    
    var product = "wrf5";
    const URL = 'https://api.meteo.uniparthenope.it/products/' + product + '/forecast/';
    var code =""; 
    return axios.get(ISTAT + citta).then((result) => {
        try {
            code = result.data[0].id;
            return axios.get(URL + code).then((results) => {
                agent.add(`il tempo a ` + citta + ` al momento e ` +
                    results.data.forecast.text.it + `, con un vento che soffia da ` +
                    results.data.forecast.winds);
            });
        } catch (error) {
            agent.add(`non riesco a soddisfare la tua richesta per `+ citta);
            return ;
        }
    });
}
    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('weather', getMeteo);
    agent.handleRequest(intentMap);

});
