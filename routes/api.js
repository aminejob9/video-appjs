var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var dotenv = require('dotenv');
dotenv.config({ path:' .././.env'});
var main = require('../Controllers/main');
var oauth = require('../Controllers/Auth');
const check_connexion = require('../middlewares/check_connexion');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('Welcome to node streaming c4 premium page');
// });

router.get('/getKey', (req, res, next)=>{
    // if(req.session.userInfos){

    // const check_key = await prisma.obs_key.findMany({where:{id_user: req.session.userInfos[0].id}});
    // if(check_key.length > 0){
    //     // res.json({status: 200, check_key[0].key});
    // }else{
        function makeid(length) {
            var result           = '';
            var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for ( var i = 0; i < length; i++ ) {
              result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
        key = makeid(50);
        // const obs_key = await prisma.obs_key.create({ data: { id_user, key , date } });
        res.json({status:200, key});
    // }
    // }else{
    //     res.json({status:404, message:"Authentication failed"});
    // }
               
    
 
})

router.post('/getStream',(req,res,next)=>{
    var title = req.body.title;
    var category = req.body.category;
    //get stream key and live url
    var stream_key = "458154861537486";
    var live_url= "http:liveèsreyjndvkcubcdvjvdjgc";

    res.render('live1',{stream_key,live_url,isLogged :1,username: req.session.userInfos[0].username});
})




module.exports = router;
