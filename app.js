/** START Import Module NodeJs **/
let session = require('cookie-session');
const moment = require('moment')
const tz = require("moment-timezone")
const express = require('express'),
    bcryptjs = require('bcryptjs'),
    mysql = require('./modules/mysql.js').mysql,
    bodyParser = require('body-parser'),
    app = express(),
    jsonParser = bodyParser.urlencoded({
        extended: false
    })
fs = require('fs');
/** END Import Module NodeJs **/
app.use(session({
    secret: 'keyboard cat'
}))

app.get('/', function(req, res) {
    const path = __dirname + '/index.html'
    res.sendFile(path, function(err) {
        if (err) {
            res.sendStatus(err.status)
        } else {
            console.log('Sent:', path);
        }
    });
});

app.get('/login', function(req, res) {
    const path = __dirname + '/login.html'
    res.sendFile(path, function(err) {
        if (err) {
            res.sendStatus(err.status)
        } else {
            console.log('Sent:', path);
        }
    });
});

app.get('/register', function(req, res) {

    const path = __dirname + '/register.html'
    res.sendFile(path, function(err) {
        if (err) {
            res.sendStatus(err.status)
        } else {
            console.log('Sent:', path);
        }
    });
});

app.get('/users/:token', function(req, res) {
    if (req.params.token.length !== 10 && req.params.token.length !== 11) {
        let reponse = {}
        reponse.error = true
        reponse.data = "le token envoyez n'est pas conforme"
        res.writeHead(401, {
            "content-type": "text/plain;"
        })
        res.end(JSON.stringify(reponse))
        return
    }
    mysql.convertTokenbyId(req.params.token).then((data, error) => {
        if (data.data[0] && data.data[0].user_id) {
            mysql.getRefreshTokenAndId(req.params.token).then(data => {
                let present_time = moment.tz('Europe/Paris').format("YYYY-MM-DDTHH:mm:ss");
                let expired = moment(data.data[0].refresh_token).diff(present_time, 'minutes');
                if (expired < -10000000) {
                    res.writeHead(401, {
                        "content-type": "text/plain;"
                    })
                    res.end(JSON.stringify({
                        error: true,
                        message: "le token envoyez n'est plus valide, veuillez le réinitialiser"
                    }))
                } else {
                    mysql.convertTokenbyId(req.params.token).then(function(result) {
                        if (result && result.data[0] && result.data[0].user_id) {
                            mysql.getJsonUsers().then(reponse => {
                                res.end(JSON.stringify(reponse))
                            })
                        } else {
                            let reponse = {}
                            reponse.error = true
                            reponse.data = "le token n'existe pas"
                            res.writeHead(401, {
                                "content-type": "text/plain;"
                            })
                            res.end(JSON.stringify(reponse))
                        }
                    })
                }
            })
        } else {
            res.writeHead(401, {
                "content-type": "text/plain;"
            })
            res.end(JSON.stringify({
                error: true,
                message: "le token envoyer n'existe pas"
            }))
        }
    })
})

app.get('/user/:token', function(req, res) {
    if (req.params.token.length !== 10 && req.params.token.length !== 11) {
        let reponse = {}
        reponse.error = true
        reponse.data = "le token envoyez n'est pas conforme"
        res.writeHead(401, {
            "content-type": "text/plain;"
        })
        res.end(JSON.stringify(reponse))
        return
    }
    mysql.convertTokenbyId(req.params.token).then((data, error) => {
        if (data.data[0] && data.data[0].user_id) {
            mysql.getRefreshTokenAndId(req.params.token).then(data => {
                let present_time = moment.tz('Europe/Paris').format("YYYY-MM-DDTHH:mm:ss");
                let expired = moment(data.data[0].refresh_token).diff(present_time, 'minutes');
                if (expired < -1) {
                    res.writeHead(401, {
                        "content-type": "text/plain;"
                    })
                    res.end(JSON.stringify({
                        error: true,
                        message: "le token envoyez n'est plus valide, veuillez le réinitialiser"
                    }))
                } else {
                    mysql.getJsonUser(data.data[0].user_id).then((result, err) => {
                        res.end(JSON.stringify(result))
                    })
                }
            })
        } else {
            res.writeHead(401, {
                "content-type": "text/plain;"
            })
            res.end(JSON.stringify({
                error: true,
                message: "le token envoyer n'existe pas"
            }))
        }
    })
})

app.delete('/user/:token', function(req, res) {
    mysql.disconnectUser(req.params.token).then(data => {
        if (data.data.changedRows == 0) {
            res.writeHead(401, {
                "content-type": "text/plain;"
            })
            res.end(JSON.stringify({
                error: false,
                message: "token n'existe pas"
            }))
        } else {
            res.end(JSON.stringify({
                error: false,
                message: "l'utilisateur a été déconnecté succés"
            }))
        }

    })
})

app.post('/register', jsonParser, function(req, res) {
    if (req.body.firstname === undefined || req.body.firstname.trim() == "" ||
        req.body.lastname === undefined || req.body.lastname.trim() == "" ||
        req.body.email === undefined || req.body.email.trim() == "" ||
        req.body.password === undefined || req.body.password.trim() == "" ||
        req.body.sexe === undefined || req.body.sexe.trim() == "" ||
        req.body.date_naissance === undefined) {

        res.writeHead(401, {
            "content-type": "text/plain;"
        })
        res.end(JSON.stringify({
            error: true,
            message: "l'une ou plusieurs des données obligatoire sont manquantes"
        }))
    } else {
        var regex_date_naissance = /^[0-9]{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/;
        var found_date_naissance = req.body.date_naissance.match(regex_date_naissance);

        var regex_email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        var found_email = req.body.email.match(regex_email);
        if (found_date_naissance === null || found_email === null) {
            res.writeHead(401, {
                "content-type": "text/plain;"
            })
            res.end(JSON.stringify({
                error: true,
                message: "l'un des données obligatoire ne sont pas conformes"
            }))
        } else {
            let user = {
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: req.body.password,
                date_naissance: req.body.date_naissance,
                sexe: req.body.sexe
            }
            mysql.registerUser(user).then(function(data) {
                res.end(JSON.stringify(data))
            })
        }

    }
})

app.put('/user/:token', jsonParser, function(req, res) {
    if (req.params.token.length !== 10 && req.params.token.length !== 11) {
        res.writeHead(401, {
            "content-type": "text/plain;"
        })
        res.end(JSON.stringify({
            error: true,
            message: "le token envoyez n'est pas conforme"
        }))
    } else {
        mysql.convertTokenbyId(req.params.token).then(data => {
            if (data.data.length == 0) {
                res.writeHead(401, {
                    "content-type": "text/plain;"
                })
                res.end(JSON.stringify({
                    error: true,
                    message: "le token envoyez n'existe pas"
                }))
            } else {
                mysql.getRefreshTokenAndId(req.params.token).then(data => {
                    let present_time = moment.tz('Europe/Paris').format("YYYY-MM-DDTHH:mm:ss");
                    let expired = moment(data.data[0].refresh_token).diff(present_time, 'minutes');
                    if (expired < -6000) {
                        res.writeHead(401, {
                            "content-type": "text/plain;"
                        })
                        res.end(JSON.stringify({
                            error: true,
                            message: "le token envoyez n'est plus valide, veuillez le réinitialiser"
                        }))
                    } else {
                        var user = req.body
                        var jsonObject = JSON.stringify(req.body)
                        var count = Object.keys(user).length;
                        if (count > 0) {
                            mysql.updateUser(user, data.data[0].user_id).then(() => {
                                res.end(JSON.stringify({
                                    error: false,
                                    message: "l'utilisateur a été modifiée succées"
                                }))
                            })
                        } else {
                            res.writeHead(401, {
                                "content-type": "text/plain;"
                            })
                            res.end(JSON.stringify({
                                error: true,
                                message: "aucun donnée n'a été envoyée"
                            }))
                        }
                    }
                })
            }
        })
    }
})

app.post('/login', jsonParser, function(req, res) {
    if (req.body.email === undefined || req.body.email.trim() == "" ||
        req.body.password === undefined || req.body.password.trim() == "") {
        res.writeHead(401, {
            "content-type": "text/plain;"
        })
        res.end(JSON.stringify({
            error: true,
            message: "l'email/password est manquant"
        }))
    } else {
        mysql.loginresponse(req.body.email, req.body.password).then(function(data) {
            if (!req.session.ob) {
                req.session.ob = []
            }
            if (data && data.data && data.data[0] && data.data[0].user_id) {
                user_id = data.data[0].user_id
                mysql.refresh_token(user_id).then(function(data) {
                    mysql.get_user_tokens(user_id).then(tokensjson => {
                        let result = tokensjson.data[0]
                        let token = result.token
                        let refresh_token = result.refresh_token
                        let createdAt = result.createdAt
                        req.session.token = token
                        res.end(JSON.stringify({
                            error: false,
                            message: "l'utilisateur a ete authentifie succee",
                            tokens: {
                                token: token,
                                refresh_token: refresh_token,
                                createdAt: createdAt
                            }
                        }))
                    })
                })
            } else {
                if (req.session.ob.length != 0) {
                    let nbr = 0
                    for (obj of req.session.ob) {
                        if (JSON.parse(obj).email == req.body.email) {
                            nbr = nbr + 1
                        }
                    }
                    if (nbr > 3) {
                        the_email = req.body.email
                        res.writeHead(409, {
                            "content-type": "text/plain;"
                        })
                        res.end(JSON.stringify({
                            error: true,
                            message: "trop de tentatives sur l'email " + the_email + " -veuillez patienter 1h"
                        }))
                    }
                    if (nbr <= 3) {
                        req.session.ob.push(JSON.stringify({
                            email: req.body.email
                        }))
                        res.writeHead(401, {
                            "content-type": "text/plain;"
                        })
                        res.end(JSON.stringify({
                            error: true,
                            message: "votre email ou password est erroné"
                        }))
                    }
                } else {
                    req.session.ob.push(JSON.stringify({
                        email: req.body.email
                    }))
                    res.writeHead(401, {
                        "content-type": "text/plain;"
                    })
                    res.end(JSON.stringify({
                        error: true,
                        message: "votre email ou password est erroné"
                    }))
                }
            }
        })
    }
})
app.listen(3000)