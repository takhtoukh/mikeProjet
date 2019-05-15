/** START Import Module NodeJs **/
const express = require('express'), // Modele de routing - Permet la gestion les routes.
    mongoose = require('mongoose'), // Module de connection et gestion de MongoDB via le NodeJs - En php equivalent de PDO
    bcryptjs = require('bcryptjs'), // Cryptage du password
    bodyParser = require('body-parser'), // Middleware - Permet de parser les données envoyer par l'utilisateur et de les traiter de manière facile.
    app = express(),
    jsonParser = bodyParser.urlencoded({ extended: false }); // Middleware - Il ce declache avant le lancenement de la function (Pour notre cas, avanc les fonction lier au route pour parser les data envoyer par le client)
/** END Import Module NodeJs **/

/** 
 * Conncetion MongoDb
 * mongodb://<address du serveur>:<port du serveur moongoDb>/<nom de la database>
 */
mongoose.connect("mongodb://localhost:27017/MikeLeRoi", function(err) {
    console.log((err) ? err : 'Connection au mongo correct') // Terner - Si tout ce passe bien, data = 'Connection au mongo correct' sinon à l'erreur lier à la connection
})

/**
 * Les Schema seront la sructure de nos données. Ils permettent de definir les attributs de données inserers
 * { type: Number, default: 0 } => Permet de definir une valeur par default
 */
const userSchema = mongoose.Schema({
        nom: String,
        prenom: String,
        email: String,
        password: String,
        token: String,
        dateNaiss: Date,
        sexe: { type: Number, default: 0 }
    }),
    userModel = mongoose.model('Users', userSchema); // Le model permet la relation entre les collection et les schemas.

let theUser = {
        nom: "Sylvestre",
        prenom: "Mike",
        email: "a@a.a",
        password: "a",
        sexe: 0,
        dateNaiss: "1993-11-22"
    } // Element test


app.get('/', function(req, res) {
    res.writeHead(200, { "content-type": "text/plain;" })
    res.sendFile(__dirname + "/index.html"); // Afficher la page index.html cote client
})

app.post('/', urlencodedParser, function(req, res) {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
    res.end(JSON.stringify({ error: false, data: req.body }))
})

app.post('/login', urlencodedParser, function(req, res) {
    // userModel.find({ email: req.body.email }, function(){}) - Rechcercher un ensemble d'utilisateur ayant la meme adress email => req.body.email
    /**
     * findOne
     * Rechcercher un SEUL utilisateur ayant la meme adress email => req.body.email
     */
    userModel.findOne({ email: req.body.email }, function(err, user) {
        if (err || user == null)
            res.end("Error")
        else {
            bcryptjs.compare(req.body.password, user.password, function(err, resp) {
                if (resp) {
                    res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
                    res.end(JSON.stringify({
                        nom: user.nom,
                        prenom: user.prenom,
                        email: user.email,
                        token: user.token,
                        sexe: user.sexe,
                        dateNaiss: user.dateNaiss
                    }))
                } else
                    res.end("Error password")
            })
        }
    })
})

app.post('/user/add', urlencodedParser, function(req, res) {
    bcryptjs.genSalt(10, function(err, salt) {
        bcryptjs.hash(theUser.password, salt, function(error, passwHash) {
            theUser.password = passwHash;
            theUser.token = Math.random().toString(36).substr(2); // Création d'un token
            let newUser = new userModel(theUser); // Nouvelle instance de model avec en param. dans le constructeur, un object permmettant la création d'un nouvelle entiter avec les caract. de l'object inserer
            newUser.save(function() { // Savegarde de l'instance
                console.log("User register")
                res.end("OK");
            })
        })
    })
})

app.put('/user/:token', urlencodedParser, function(req, res) {
    console.log(req.body)
    bcryptjs.genSalt(10, function(err, salt) { // Creation d'une salt (grain de sel) permettant le cryptage du password.
        bcryptjs.hash(req.body.password, salt, function(error, passwHash) { // Cryptage du password avec la salt
            req.body.password = (req.body.password == "") ? undefined : passwHash
            userModel.updateOne({ token: req.params.token }, req.body, function(err) {
                if (err)
                    res.end("Error update")
                else
                    res.end("Good update")

            })
        })
    })
})

app.delete('/users', function(req, res) {
    userModel.deleteMany({})
    res.end("ok")
})

app.delete('/user/:token', function(req, res) {
    userModel.findOneAndDelete({ token: req.params.token }, (err, data) => {
        console.log(err)
        console.log(data)
        res.end("ok")
    })
})

app.get('/user/:token', function(req, res) {
    console.log(req.params.token)
    userModel.findOne({ token: req.params.token }, function(err, user) {
        if (err || user == null)
            res.end("Error")
        else {
            res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
            res.end(JSON.stringify({
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                token: user.token,
                sexe: user.sexe,
                dateNaiss: user.dateNaiss
            }))
        }
    })
})

app.get('/users', function(req, res) {})

app.get('/error', function(req, res) {
    res.writeHead(501, { "content-type": "application/json; charset=utf-8" })
    res.end(JSON.stringify({ error: "route error" }))
})

app.listen(5000, function() {
    console.log('Serv run')
})