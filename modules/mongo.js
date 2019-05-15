/** START Import Module NodeJs **/
const mongoose = require('mongoose')
    /** END Import Module NodeJs **/

let databaseMongo = {}

/** 
 * Conncetion MongoDb
 * mongodb://<address du serveur>:<port du serveur moongoDb>/<nom de la database>
 */
mongoose.connect("mongodb://localhost:27017/project", function(err) {
    databaseMongo.error = (err) ? true : false
    console.log((err) ? err : 'Connection au mongo correct')
})

const analyticSchema = mongoose.Schema({
    id: Number,
    task: String,
    page: String,
    createdAt: { type: Date, default: Date.now }
});

databaseMongo.analyticModel = mongoose.model("analytic", analyticSchema);

exports.mongobd = databaseMongo;