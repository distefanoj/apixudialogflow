//Requires
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const weather = require('./weatherlib');
const serviceAccount = require('./serviceAccountKey.json')
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');




//Configuración Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://porterointeligente-3fe94.firebaseio.com'
});
var db = admin.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);




//Variables globales
let nombre = "";
let apellido = "";
let mail = "";
let presente = "";


//Configuración de Correo
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'distefanoj138@gmail.com',
        pass: 'hesyqaxriaqarqyx'
    }
});
//pass google:hesyqaxriaqarqyx



//Variables de entorno
process.env.PORT = process.env.PORT || 3000;


//Configuración para acceder al body
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
    // parse application/json
app.use(bodyParser.json())





//Respuesta del post
app.post('/', function(req, res) {


    //Flujo para responder a la consulta por una persona
    if (req.body.result.action == "consulta-persona") {
        nombre = encodeURI(req.body.result.parameters.Nombre); //Se obtiene el nombre de la persona buscada
        getUsuario(nombre) //Se invoca función de búsqueda
    }




    //Flujo para tomar mensajes
    if (req.body.result.action == "deja-mensaje") {
        //Se verifica que exista el mensaje
        if (req.body.result.parameters.Mensaje != "") {
            mensaje = decodeURI(req.body.result.parameters.Mensaje); //Se guarda el mensaje
            //Se verifica que exista el nombre de la persona que lo deja
            if (req.body.result.parameters.Name != "") {
                emisor = decodeURI(req.body.result.parameters.Name); //Se guarda el nombre del emisor
                tomaMensaje(req.body.result.contexts[0].parameters.Nombre, emisor, mensaje) //Se invoca función para tomar mensaje
            } else {
                //Se interroga quien deja el mensaje
                texto = "¿De parte de quién?"
                return res.json({
                    speech: texto,
                    displayText: texto,
                    source: 'team info'
                });
            }
        } else {
            //Se solicita que se repita el mensaje
            texto = "Repita por favor"
            return res.json({
                speech: texto,
                displayText: texto,
                source: 'team info'
            });
        }
    }









    //Función para cargar datos de usuario
    function tomaMensaje(username, emisor, mensaje) {
        //Se busca datos del habitante al que se le dejará el mensaje
        db.collection('habitantes').get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    //Se cargan datos del habitante al cual se le enviará el mensaje
                    if (doc.data().Nombre == username) {
                        datoshabitante = {
                                nombre: doc.data().Nombre,
                                apellido: doc.data().Apellido,
                                mail: doc.data().Mail
                            }
                            //Se prepara el correo
                        var mailOptions = {
                            from: emisor,
                            to: datoshabitante.mail,
                            subject: 'Protero Inteligente: Nuevo mensaje',
                            html: '<h1>Mensaje de <b>' + emisor + '</b> </h1><br><p>' + mensaje + '</p>'
                        };
                        //Se envía el correo
                        transporter.sendMail(mailOptions, function(error, info) {
                            if (error) {
                                //console.log(error);
                            } else {
                                //console.log('Email sent: ' + info.response);
                            }
                        });
                        texto = 'Listo le aviso. Hasta luego'; //Respuesta para el bot
                        return res.json({
                            speech: texto,
                            displayText: texto,
                            source: 'notificacion'
                        });
                    };
                });
            })
    }


    //Función para responder a la consulta por una persona
    function getUsuario(username) {
        let vive = false;
        let presente = false;
        //Se busca el habitante por el cual se pregunta
        db.collection('habitantes').get()
            .then((snapshot) => {
                snapshot.forEach((doc) => {
                    if (doc.data().Nombre == username) {
                        nombre = doc.data().Nombre;
                        apellido = doc.data().Apellido;
                        mail = doc.data().Mail;
                        presente = doc.data().Presente;
                        vive = true;
                        if (doc.data().Presente) {
                            presente = true;
                        }
                    }
                });
                //Se verifica si la persona vive en el domicilio
                if (vive) {
                    //Se verifica si la persona está presente
                    if (presente) {
                        texto = 'Un momento por favor';
                        return res.json({
                            speech: texto,
                            displayText: "Repita su pregunta por favor",
                            source: 'team info'
                        });
                    } else {
                        texto = 'En esto momento no se encuentra. ¿Desea dejar un mensaje?';
                        return res.json({
                            speech: texto,
                            displayText: "Repita su pregunta por favor",
                            source: 'team info'
                        });
                    }
                } else {
                    texto = 'Acá no vive esa persona. Hasta luego'; //Si no habita el domicilio se informa que está equivocado
                    return res.json({
                        speech: texto,
                        displayText: "Repita su pregunta por favor",
                        source: 'team info'
                    });
                }
            })
            .catch((err) => {
                console.log('Error getting documents', err);
            });
    }













});





































app.listen(process.env.PORT, () => {
    console.log("Escuchando puerto: ", process.env.PORT);
});