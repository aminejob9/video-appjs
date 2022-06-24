
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

router.post('/follow', async (req, res)=>{
   var b = req.body.room_id;
   var id_room = parseInt(b);
   const subscribe =  await prisma.subscribers.findMany(
    {where:
        {   id_user: req.session.userInfos[0].id,
            id_room
        }
    });

    if(subscribe.length > 0){
        const delete_sub = await prisma.subscribers.delete({where: {id : subscribe[0].id}});
        response = '<a onclick="follow()" style="background:#3c3f46; border:none;" data-note="Sign in to subscribe, only logged in users can subscribe to the channel." class="btnn-default btnn-primary subscribe-button" data-author-id="1" data-post-id="-1">'
		+'<i class="icon far fa-heart"></i><span>Subscribe</span></a>';
    }else{
        const insert_sub = await prisma.subscribers.create({ data: { id_user:req.session.userInfos[0].id, id_room} });
        response = '<a onclick="follow()" data-note="Sign in to subscribe, only logged in users can subscribe to the channel." class="btnn-default btnn-primary subscribe-button" data-author-id="1" data-post-id="-1">'
		+'<i class="icon far fa-heart"></i><span>Subscribe</span></a>';
    }
   

    // la variable response est un objet JSON contenant ce que tu souhaite retourner au client
    return res.send(200, response);
});

router.post('/count',async (req, res) => {
   var b = req.body.room_id;
   var id_room = parseInt(b);
   const subscribe =  await prisma.subscribers.findMany(
    {where:
        {id_room}
    });
    response=subscribe.length;
})


module.exports = router;
