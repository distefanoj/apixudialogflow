//Requires
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const weather = require('./weatherlib');

//Variables de entorno
process.env.PORT = process.env.PORT || 3000;


//Configuración para acceder al body
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
    // parse application/json
app.use(bodyParser.json())


//Respuesta del post
app.post('/', function(req, res) {


    var speech =
        req.body.result &&
        req.body.result.parameters &&
        req.body.result.parameters.address &&
        req.body.result.parameters.address.location ?
        req.body.result.parameters.address.location :
        "Seems like some problem. Speak again.";
    return res.json({
        speech: speech,
        displayText: speech,
        source: "webhook-echo-sample"
    });

});

app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto: ", process.env.PORT);
});