/** START Import Module NodeJs **/
const http = require("http"); // Chargement du module HTTP - Il permet la création d'un serveur sous NodeJs
/** END Import Module NodeJs **/

/*
 *
 *   Création d'un serveur sous NodeJs
 *   Version sans express
 *
 */


let serv = http.createServer(function(req, res) { // Création d'un serveur - La fonction anonyme ( Function qui n'a pas de nom ) est appeller à chaque fois qu'un utilisateur va sur votre site
    let Mike = {
        name: 'Sylvestre',
        prenom: 'Mike'
    }
    console.log(req.url) // Affiche les console dans l'interface serveur - PAS DANS LE NAVIGATEUR - req.url permets la récuperation de l'url appelle par l'utilisateur sur le navigateur
    if (req.url == '/') { // Si l'utilisateur n'a pas mise de route (http://localhost:8080)
        res.end("<h1>OOUUII Zoubida</h1>") // Ecriture sur la page - res.end => echo en php - Elle affiche du code html
    } else if (req.url == '/user') { // Si l'utilisateur tape une route (http://localhost:8080/user)
        res.writeHead(200, { "Content-Type": "application/json" }); // Definition du code error - https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP
        res.end(JSON.stringify(Mike)) // Ecriture sur la page - res.end => echo en php
    } else {
        res.end("<p>Non je ne suis pas présent</p>") // Envoi au client, le fichier html
    }
})

serv.listen(5000); // Lancement du serveur sur un port - https://fr.wikipedia.org/wiki/Liste_de_ports_logiciels