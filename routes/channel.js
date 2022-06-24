var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dotenv = require('dotenv');
dotenv.config({ path:' .././.env'});
var main = require('../Controllers/main');
var oauth = require('../Controllers/Auth');
const check_connexion = require('../middlewares/check_connexion');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('Welcome to node streaming c4 premium page');
// });

router.get('/', check_connexion.checkIfUserIsConnected ,main.create_channel);
router.get('/create', check_connexion.checkIfUserIsConnected ,main.create_channel);



module.exports = router;
