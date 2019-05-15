/** START Import Module NodeJs **/
let session = require('cookie-session');
const express = require('express'),
    bcryptjs = require('bcryptjs'),
    mysql = require('./modules/mysql.js').mysql,
    bodyParser = require('body-parser'),
    app = express(),
    jsonParser = bodyParser.urlencoded({ extended: false }),
    fs = require('fs');
/** END Import Module NodeJs **/
app.use(session({secret: 'keyboard cat'}))


app.get('/',function(req,res){
    const path = __dirname + '/index.html'
    res.sendFile(path, function (err){
        if (err) {
              res.sendStatus(err.status)
            }
            else {
              console.log('Sent:', path);
            }
    });
});

app.get('/login',function(req,res){
    console.log(req.session.ob)
    const path = __dirname + '/login.html'
    res.sendFile(path, function (err){
        if (err) {
          res.sendStatus(err.status)
        }
        else {
              console.log('Sent:', path);
            }
    });
});

app.get('/register',function(req,res){
    console.log(req.session.ob)
    const path = __dirname + '/register.html'
    res.sendFile(path, function (err){
        if (err) {
              res.sendStatus(err.status)
            }
            else {
              console.log('Sent:', path);
            }
    });
});
app.get('/users/:token', function(req, res) {
    mysql.convertTokenbyId(req.params.token).then(function(result) {
        if(result && result.data[0] && result.data[0].user_id){
            mysql.getJsonUsers().then(reponse =>{
                console.log(reponse)
                res.end(JSON.stringify(reponse))    
            })
            
        }else{
            let reponse = {}
                reponse.error = true
                reponse.data = "le token n'existe pas"
                res.end(JSON.stringify(reponse))
            }
        
    })
})

app.get('/user/:token', function(req, res) {
    mysql.convertTokenbyId(req.params.token).then((data)=> {
        console.log(data)
        mysql.getJsonUser(data.data[0].user_id).then(result=>{
            console.log("====",result)
            res.end(JSON.stringify(result))
        })
        
    })
})



app.post('/register', jsonParser, function(req, res){
    console.log(res)
    console.log(req)
    console.log(req.body)
    console.log(req.session.ob)
    if(req.body.firstname === undefined || req.body.firstname.trim() == "" 
    || req.body.lastname === undefined || req.body.lastname.trim() == ""
    || req.body.email === undefined || req.body.email.trim() == ""
    || req.body.password === undefined || req.body.password.trim() == ""
    || req.body.sexe === undefined || req.body.sexe.trim() == ""
    || req.body.date_naissance === undefined)
    
    res.end(JSON.stringify({
        error: true,
        message: "l'une ou plusieurs des données obligatoire sont manquantes"
        }))
    else{
        let user = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            date_naissance: req.body.date_naissance,
            sexe: req.body.sexe
        }
        mysql.registerUser(user).then(function(data){
            res.end(JSON.stringify(data))
        })
    }
})

app.put('/user/:token', jsonParser, function(req, res){
    console.log(req.body)
    res.end(JSON.stringify({
        error: false,
        message: "l'une ou"
        }))
})


app.post('/login', jsonParser, function(req, res){
    console.log(req.body)

    if(req.body.email === undefined || req.body.email.trim() == ""
    || req.body.password === undefined || req.body.password.trim() == "")

        res.end(JSON.stringify({
            error: true,
            message: "l'email/password est manquant"
        }))
    else{
        mysql.loginresponse(req.body.email,req.body.password).then(function (data){
            if(!req.session.ob){
                req.session.ob = []
            }
            if(data && data.data && data.data[0] && data.data[0].user_id){
                 user_id = data.data[0].user_id
                 console.log(user_id)
                 mysql.refresh_token(user_id).then(function (data) {
                    mysql.get_user_tokens(user_id).then( tokensjson => {
                        console.log(tokensjson.data)
                        let result = tokensjson.data[0]
                        let token = result.token
                        let refresh_token = result.refresh_token
                        let createdAt = result.createdAt
                        req.session.token = token
                        res.end(JSON.stringify({
                        error: false,
                        message: "l'utilisateur a ete authentifie succee",
                        tokens:{
                            token : token,
                            refresh_token : refresh_token,
                            createdAt : createdAt
                        }
                    }))
                    })
                    console.log(user_id)
                })
            }else{
                console.log("soufiane",req.session.ob)
                
                if(req.session.ob.length != 0){
                    let nbr = 0
                    for(obj of req.session.ob){
                        
                        if(JSON.parse(obj).email == req.body.email){nbr = nbr+1}
                        
                    }
                    console.log("nbr",nbr)
                            if(nbr > 3){
                                console.log("+3")
                                the_email = req.body.email
                                console.log("soufiane",the_email)
                                res.end(JSON.stringify({
                                    error: true,
                                    message: "trop de tentatives sur l'email "+ the_email +" -veuillez patienter 1h"
                                }))
                            }
                            if(nbr <= 3){
                                console.log("-3")
                                req.session.ob.push(JSON.stringify({email: req.body.email}))
                                res.end(JSON.stringify({
                                    error: true,
                                    message: "votre email ou password est erroné"
                                }))
                            }
                }else{
                    req.session.ob.push(JSON.stringify({email: req.body.email}))
                    console.log(req.session.ob)
                    res.end(JSON.stringify({
                        error: true,
                        message: "votre email ou password est erroné"
                    }))
                }
            }
        })
        /*mysql.refresh_token(1).then(function(data){
            console.log(JSON.stringify(data))
            res.end("okok")
        })*/
    }
})
app.listen(3000)