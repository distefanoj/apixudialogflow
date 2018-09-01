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


    let ciudad = req.body.result &&
        req.body.result.parameters &&
        req.body.result.parameters.address &&
        req.body.result.parameters.address.city ?
        req.body.result.parameters.address.city :
        "Seems like some problem. Speak again.";

    location = encodeURI(ciudad);
    weather.currentWeather(location, function(clima) {
        let resp = JSON.parse(clima);
        texto = `La temperatura actual en ${resp.location.name} es de ${resp.current.temp_c}º Celsius`;

        return res.json({
            speech: texto,
            displayText: texto,
            source: 'team info'
        });
    });

});

app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto: ", process.env.PORT);
});