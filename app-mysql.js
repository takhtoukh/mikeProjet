/** START Import Module NodeJs **/
const express = require('express'), // Modele de routing - Permet la gestion les routes.
    bodyParser = require('body-parser'), // Middleware - Permet de parser les données envoyer par l'utilisateur et de les traiter de manière facile.
    app = express(),
    bdd = mysql.createConnection({
        host: 'localhost',
        user: 'mike',
        password: 'mike',
        database: 'cpcsi2'
    }); // Initialisation de la base de donnée
/** END Import Module NodeJs **/


bdd.connect(); // Connection à la base de donnée MySql

const urlencodedParser = bodyParser.urlencoded({ extended: false }) // Middleware - Il ce declache avant le lancenement de la function (Pour notre cas, avanc les fonction lier au route pour parser les data envoyer par le client)

/** START Création de route sous express NodeJs **/
app.get('/', function(req, res) { // Création d'un route sous express
    res.writeHead(200, { "content-type": "text/plain;" })
    res.sendFile(__dirname + "/index.html"); // Afficher la page index.html cote client
})

app.post('/', urlencodedParser, function(req, res) {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
    res.end(JSON.stringify({ error: false, data: req.body }))
})

app.post('/user/add', urlencodedParser, function(req, res) {
    let retour = {
        error: false,
        message: []
    }

    if (req.body.nom === undefined || req.body.nom.trim() == "") {
        retour.error = true;
        retour.message.push("La variable Nom n'est pas definie")
    }

    if (req.body.prenom === undefined || req.body.prenom.trim() == "") {
        retour.error = true;
        retour.message.push("La variable Prenom n'est pas definie")
    }

    if (req.body.dateNaiss === undefined || req.body.dateNaiss.trim() == "") {
        retour.error = true;
        retour.message.push("La variable Date de Naissance n'est pas definie")
    }

    if (req.body.sexe === undefined || req.body.sexe.trim() == "") {
        retour.error = true;
        retour.message.push("La variable Sexe n'est pas definie")
    }

    if (retour.error == true) {
        res.writeHead(403, { "content-type": "application/json; charset=utf-8" })
        res.end(JSON.stringify(retour))
    } else {

        bdd.query("INSERT INTO `user` (`id`, `nom`, `prenom`, `dateNaiss`, `sexe`) VALUES (NULL, '" + req.body.nom + "', '" + req.body.prenom + "', '" + req.body.dateNaiss + "', '" + req.body.sexe + "');", function(error, result) { // Lancement de la requet SQL
            if (error)
                throw error;
            res.writeHead(201, { "content-type": "application/json; charset=utf-8" })
            res.end(JSON.stringify(result))

        })
    }

})

app.get('/user/:id', function(req, res) {
    console.log(req.params.id)
    bdd.query("SELECT * FROM user WHERE id = " + req.params.id, function(error, result) {
        if (error)
            throw error;
        if (result.length == 0) {
            res.end("<h2>User not exist</h2>")
        } else {
            res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
            res.end(JSON.stringify(result[0]))
        }
    })
})

app.get('/users', function(req, res) {
    bdd.query("SELECT * FROM user", function(error, result) {
        if (error)
            throw error;
        res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
        res.end(JSON.stringify(result))
    })
})

app.get('/error', function(req, res) {
    res.writeHead(501, { "content-type": "application/json; charset=utf-8" })
    res.end(JSON.stringify({ error: "route error" }))
})

/** END Création de route sous express NodeJs **/

app.listen(8080, function() { // Lancement du serveur sur un port
    console.log('Serv run') // http://localhost:8080
})