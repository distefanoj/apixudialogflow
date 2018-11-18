//Requires
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const weather = require('./weatherlib');
const serviceAccount = require('./serviceAccountKey.json')
const admin = require('firebase-admin');



//Configuración Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://porterointeligente-3fe94.firebaseio.com'
});
var db = admin.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);




//Variables globales
let nombre = ""



//Variables de entorno
process.env.PORT = process.env.PORT || 3000;


//Configuración para acceder al body
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
    // parse application/json
app.use(bodyParser.json())





//Respuesta del post
app.post('/', function(req, res) {



    if (req.body.result.action == "consulta-persona") {

        nombre = req.body.result.parameters.Nombre;
        let res = getUsuario(nombre);
        return res;




    }





    //Consulta de clima
    if (req.body.result.action == "weather") {

        let ciudad = req.body.result &&
            req.body.result.parameters &&
            req.body.result.parameters.address &&
            req.body.result.parameters.address.city ?
            req.body.result.parameters.address.city :
            "error";

        if (ciudad === "error") {
            return res.json({
                speech: "Repita su pregunta por favor",
                displayText: "Repita su pregunta por favor",
                source: 'team info'
            });
        }

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

    }
















});















//Función para responder a la consulta por una persona
function getUsuario(username) {
    db.collection('habitantes').get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                if (doc.data().Nombre == username) {




                    texto = 'Esta persona vive en el domicilio';

                    return res.json({
                        speech: texto,
                        displayText: texto,
                        source: 'team info'
                    })


                } else {


                    texto = 'Esta persona NO vive en el domicilio';

                    return res.json({
                        speech: texto,
                        displayText: texto,
                        source: 'team info'
                    })
                }

            });
        })
        .catch((err) => {
            console.log('Error getting documents', err);
        });
}






















app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto: ", process.env.PORT);
});