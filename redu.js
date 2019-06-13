/**
 * Ho usato questo codice per ridurre il file comuni.json 
 * perche e talmente grande da essere intrattabile
 * 
 * Estraggo dal file tutti i comuni della campania,
 * di questi ne prendo solo il nome e il codice istat 
 * 
 * poi creo il file comunimod.json 
 */

var comuni = require ('./comuni.json');
var fs = require('fs');

var out = "[\n"
comuni.forEach(element => {
    if (element.regione.nome == "Campania" ) {
        out += ' {\n"nome" : '+ '"'+element.nome +'"'+',\n "codice" :'+'"'+ element.codice+ '"'+'\n },\n';
    }
    
});
out+=']'; 

console.log (out);
fs.writeFile("comunimod.json", out, err=>{
    if (err) console.log (err); 
});