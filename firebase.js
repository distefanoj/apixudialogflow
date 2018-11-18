const firebase = require("firebase-admin");
const serviceAccount = require('./serviceAccountKey.json')


const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://porterointeligente-3fe94.firebaseio.com'
});

var db = admin.firestore();
const settings = { timestampsInSnapshots: true };
db.settings(settings);



var cityRef = db.collection('cities').doc('SF');
var getDoc = cityRef.get()
    .then(doc => {
        if (!doc.exists) {
            console.log('No such document!');
        } else {
            console.log('Document data:', doc.data());
        }
    })
    .catch(err => {
        console.log('Error getting document', err);
    });