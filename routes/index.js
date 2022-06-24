var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dotenv = require('dotenv');
dotenv.config({ path:' .././.env'});
var main = require('../Controllers/main');
var oauth = require('../Controllers/Auth');
var stream = require('../Controllers/stream')
const check_connexion = require('../middlewares/check_connexion');


/* Auth Routes */
router.get('/login',check_connexion.checkIfUserIsNotConnected,oauth.login);
router.post('/oauth',oauth.oauth);
router.get('/auth/api/discord/redirect',oauth.discord)

router.get('/auth/api/google/redirect',oauth.google)
router.get('/register',oauth.register);

router.get('/register',check_connexion.checkIfUserIsNotConnected,oauth.register);

router.post('/signup',oauth.signup);
router.get('/signup/verify',oauth.verify);
router.get('/logout',oauth.logout);
router.post('/changeSettings',main.changeSettings);
router.post('/create_channel',main.postcreateChannel);

/* GET home page. */
router.get('/',main.index);
router.get('/upload', check_connexion.checkIfUserIsConnected, main.upload);
router.get('/channels',main.channels);

// router.get('/single_channel', check_connexion.checkIfUserIsConnected ,main.single_channel);
router.get('/channel/:param1' ,main.single_channel);
router.get('/create', check_connexion.checkIfUserIsConnected ,main.create_channel);

router.get('/live/:idStream',check_connexion.checkIfUserIsConnected,main.live);
router.get('/startlive', check_connexion.checkIfUserIsConnected ,main.startlive);

//router.get('/meeting', check_connexion.checkIfUserIsConnected ,main.meeting);
router.get('/history', check_connexion.checkIfUserIsConnected ,main.history);
router.get('/account', check_connexion.checkIfUserIsConnected ,main.account);
router.get('/settings', check_connexion.checkIfUserIsConnected ,main.settings);
router.get('/access_denied', check_connexion.checkIfUserIsNotConnected ,main.access_denied);
router.get('/test',main.test);
router.get('/search',main.search);
router.get('/blog/:param1',main.blog);

/* streaming Routes */

router.get('/stream/get-token',stream.generateToken)
router.get('/meeting',stream.meetings)
router.post('/startStream',check_connexion.checkIfUserIsConnected,stream.liveStream)
router.get('/streams',check_connexion.checkIfUserIsConnected,stream.streams)
router.get('/vod',check_connexion.checkIfUserIsConnected,stream.vod)

module.exports = router;
