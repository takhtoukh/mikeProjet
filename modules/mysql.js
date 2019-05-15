const moment = require('moment')

let mysql = require("mysql"),
    bdd = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'project'
    });

bdd.connect(); // Connection à la base de donnée MySql

bdd.convertTokenbyId = function(token) {
    return new Promise(function(resolve, reject) {
        console.log(token)
        bdd.query("SELECT user_id FROM tokens WHERE token = '" + token + "'", function(err, result) {
            let reponse = {}
            reponse.error = (err | result == null) ? true : false
            reponse.data = result;
            resolve(reponse)
        })
    })
}
bdd.getJsonUsers = function() {
    return new Promise(function(resolve, reject) {
        bdd.query("SELECT firstname,lastname,date_naissance,sexe FROM users", function(err, result) {
            let reponse = {}
            reponse.error = (err | result == null) ? true : false
            reponse.data = result;
            console.log(reponse)
            resolve(reponse)
        })
    })
}
bdd.getJsonUser = function(user_id) {
    console.log(user_id)
    return new Promise(function(resolve, reject) {
        bdd.query("SELECT * FROM users WHERE user_id = '" + user_id + "'", function(err, result) {
            let reponse = {}
            reponse.error = (err | result == null) ? true : false
            reponse.data = result;
            resolve(reponse)
        })
    })
}
bdd.refresh_token = function(user_id) {
    return new Promise(function(resolve, reject) {
        let present_time = moment().format("YYYY-MM-DDTHH:mm:ss");
        console.log(present_time)
        console.log("update tokens set refresh_token = '"+ present_time+ "' WHERE user_id = '" + user_id + "'")
        bdd.query("update tokens set refresh_token = '"+ present_time+ "' WHERE user_id = '" + user_id + "'", function(err, result) {
            let reponse = {}
            reponse.error = (err | result == null) ? true : false
            reponse.data = result;
            console.log("===",reponse)
            resolve(reponse)
        })
    })
}
bdd.get_user_tokens = function(user_id) {
    return new Promise(function(resolve, reject) {
        console.log("select * from tokens where user_id = '"+ user_id+ "'")
        bdd.query("select * from tokens where user_id = '"+ user_id+ "'", function(err, result) {
            let reponse = {}
            reponse.error = (err | result == null) ? true : false
            reponse.data = result;
            console.log("===",reponse)
            resolve(reponse)
        })
    })
}
bdd.loginresponse = function(email,password) {
    return new Promise(function(resolve, reject) {
        bdd.query("SELECT user_id FROM users WHERE email = '" + email + "' AND password = '" + password +"'", function(err, result) {
            console.log("SELECT user_id FROM users WHERE email = '" + email + "' AND password = '" + password + "'")
            let reponse = {}
            reponse.error = (err | result == null) ? true : false
            reponse.data = result;
            console.log(reponse)
            resolve(reponse)
        })
    })
}
bdd.registerUser = function(user){
    console.log("registerusermeth")
    return new Promise(function(resolve, reject){
        console.log("theuser",user)
        bdd.query('INSERT INTO users SET?', user, function(err, result){
            let token = Math.random().toString(36).substr(2);
            let theToken = {
                token : token,
                user_id: result.insertId,
                refresh_token: new Date(),
                revoquer: false
                
            }
            bdd.query('INSERT INTO tokens SET?', theToken, function(err, result){
            let response = {}
            console.log(theToken)
            response.error = (err | result == null) ? true : false
            response.data = {
                token: token,
                refresh_token : theToken.refresh_token
            };
            resolve(response)
            })
        })
    })
}

exports.mysql = bdd
