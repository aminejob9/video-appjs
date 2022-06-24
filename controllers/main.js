var mysql = require('mysql');
var dotenv = require('dotenv');
dotenv.config({ path: ' .././.env' });
var path = require('path');
const url = require('url');   
const fetch = require('node-fetch');

// public foldeer
var app = require('.././app.js')
var express = require('express');
// JWT for tokens
// ORM Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

// to hash the password
const byrpt = require('bcryptjs');

// videSdk

var jwt = require("jsonwebtoken");
var uuid4 = require("uuid4");

// Need to generate from app.videosdk.live
/*
const API_KEY = "5f8d5187-fe72-4f5b-a2c7-0e79ff3a22f7";
const SECRET_KEY = "481342e396423b88d88253d5585a22ec0771fd3b0121aa69499d784fe851e35e";

jwt.sign(
  {
    apikey: API_KEY,
    permissions: ["allow_join"], // Permission to join the meeting
  },
  SECRET_KEY,
  {
    algorithm: "HS256",
    expiresIn: "24h",
    jwtid: uuid4(),
  },
  function (err, token) {
    //console.log(token);
  }
);

const getToken = async () => {
    try {
      const response = await fetch(`http://localhost:3000/get-token`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const { token } = await response.json();
      return token;
    } catch (e) {
      console.log(e);
    }
  };
  
const getMeetingId = async (token) => {
try {
    const VIDEOSDK_API_ENDPOINT = `http://localhost:3000/create-meeting`;
    const options = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, region: "sg001" }),
    };
    const response = await fetch(VIDEOSDK_API_ENDPOINT, options)
    .then(async (result) => {
        const { meetingId } = await result.json();
        return meetingId;
    })
    .catch((error) => console.log("error", error));
    return response;
} catch (e) {
    console.log(e);
}
};
  
/** This API is for validate the meeting id  */
/** Not require to call this API after create meeting API  
const validateMeeting = async (token, meetingId) => {
try {
    const VIDEOSDK_API_ENDPOINT = `http://localhost:3000/validate-meeting/${meetingId}`;
    const options = {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
    };
    const response = await fetch(VIDEOSDK_API_ENDPOINT, options)
    .then(async (result) => {
        const { meetingId } = await result.json();
        return meetingId;
    })
    .catch((error) => console.log("error", error));
    return response;
} catch (e) {
    console.log(e);
}
};
  
const access_token =  getToken();
const meetingId =  getMeetingId(access_token);
console.log(access_token,meetingId);
  //

*/


//Change seetings
exports.changeSettings = async(req,res) => {
    id=req.session.userInfos[0].id;
    const username=req.body.username;
    const email = req.body.email;
    const country = req.body.country;
    const city=req.body.city;

    if(req.body.password || req.body.confirmPassword) {
        if(req.body.password == req.body.confirmPassword){
            const password = req.body.password;
            //Update avec password
            let passwordHashed = await byrpt.hash(password, 10);
            const updateUser = await prisma.users.update({
                where: {
                    id:id,
                },
                data: {
                  email: email,
                  username :username,
                  country :country,
                  city: city,
                  password :passwordHashed
                },
              })
              return res.redirect(url.format({
                pathname:"/settings",
                query:{
                    status:200,
                    message:'Update success'
                }
            }))
        }else{
            return res.redirect(url.format({
                pathname:"/settings",
                query:{
                    status:500,
                    message:'password is invalid'
                }
            }))
        }
    }else{
        //Update normal
        const updateUser = await prisma.users.update({
            where: {
              id:id,
            },
            data: {
              email: email,
              username :username,
              country :country,
              city: city
            },
          })
          return res.redirect(url.format({
            pathname:"/settings",
            query:{
                status:200,
                message:'Update success'
            }
        }))
    }

}
//Change settings


exports.index = async (req,res)=>{

    // const categories = await prisma.categories.findMany();
    
    
    if(req.session.userInfos){
        res.render('index1', { title: 'Home', isLogged: 1, username: req.session.userInfos[0].username});
    }else{
        res.render('index1', { title: 'Home', isLogged: 0, username:""});
    }
    // res.render('index1');

}

exports.upload = async (req,res)=>{
    const room = await prisma.rooms.findMany({where:{id_user: req.session.userInfos[0].id}});
    if(room.length > 0){
        channel_name = "/channel/"+room[0].name;
    }else{
        channel_name = "/create";
    }

    if(req.session.userInfos){
        res.render('upload', { title: 'Upload Video' , isLogged: 1, username: req.session.userInfos[0].username,channel_name});
    }else{
        res.render('upload', { title: 'Upload Video' , isLogged: 0, username: "",channel_name});
    }
}

exports.channels = async (req,res)=>{
    const categories = await prisma.categories.findMany();
    if(req.session.userInfos){
        res.render('channels', { title: 'Channels', isLogged:1, username: req.session.userInfos[0].username, categories:JSON.stringify(categories)});
    }else{
        res.render('channels', { title: 'Channels', isLogged:0,username:"", categories:JSON.stringify(categories)});        
    }
}

exports.single_channel = async (req,res)=>{
    var room_name = req.params.param1;
    // const categories = await prisma.categories.findMany();
    const room =  await prisma.rooms.findMany(
        {where:
            {name:room_name}
    });
    var room_id = room[0].id;

    //Count subscribers
    const subscribe1 =  await prisma.subscribers.findMany(
        {where:
            {id_room:room_id}
        });
    var countSub = subscribe1.length ;
    //Count subscribers

        if(req.session.userInfos){
//Check if user connected is the owner of the channel
            var username = req.session.userInfos[0].username;
            if(room_name == username){
                user_state = 1;
            }else{
                user_state = 0;
            }
//Check if user connected is the owner of the channel

            //Check if user connected have already subscribe to the channel
            const subscribe =  await prisma.subscribers.findMany(
                {where:
                    {   id_user: req.session.userInfos[0].id,
                        id_room:room_id
                    }
                });
                if(subscribe.length > 0){
                    user_state =2;
                }
            //Check if user connected have already subscribe to the channel

            

            res.render('channel1', { title: room_name+' - channel'+'', isLogged: 1,username,user_state,room_name,room_id,countSub});    
        }else{
            user_state = 0;
            res.render('channel1', { title: room_name+' - channel'+'', isLogged: 0,username:"",user_state,room_name,room_id,countSub});    
        }
    }
//  res.render('channel1');
    
    
        
    


exports.blog = async function (req, res) {
    res.render('blog');
}

exports.live = async (req,res)=>{
    // const categories = await prisma.categories.findMany();
    // const room = await prisma.rooms.findMany({where:{id_user: req.session.userInfos[0].id}});
    // if(room.length > 0){
    //     channel_name = "/channel/"+room[0].name;
    // }else{
    //     channel_name = "/create";
    // }
    const idStream = req.params.idStream;
    try{
        
    }
    catch(err){

    }
    // if(req.session.userInfos){
    //     res.render('live', { title: 'Live', isLogged: 1, username: req.session.userInfos[0].username, categories:JSON.stringify(categories),channel_name});
    // }else{
    //     res.render('live', { title: 'Live', isLogged: 0,username: "", categories:JSON.stringify(categories),channel_name});
    // }    
    res.render('live1',{ title: 'Live',isLogged :1,username: req.session.userInfos[0].username});
}

exports.startlive = async (req,res)=>{
    const categories = await prisma.categories.findMany();
    

    res.render('start_live',{ title: 'Start Live',isLogged :1,username: req.session.userInfos[0].username,categories:JSON.stringify(categories)});
}

exports.meeting = async (req, res) => {
    res.render('meeting',{ title: 'Start meeting',isLogged :1,username: req.session.userInfos[0].username});
}

exports.history = async (req,res)=>{
    const categories = await prisma.categories.findMany();
    if(req.session.userInfos){
        res.render('history', { title: 'History', isLogged:1, username: req.session.userInfos[0].username, categories:JSON.stringify(categories)});
    }else{
        res.render('history', { title: 'History', isLogged:0,username: "", categories:JSON.stringify(categories)});
    }  
}

exports.account = async (req,res)=>{
    const categories = await prisma.categories.findMany();

    if(req.session.userInfos){
        res.render('account', { title: 'Account', isLogged:1, username: req.session.userInfos[0].username, categories:JSON.stringify(categories)});
    }else{
        res.render('account', { title: 'Account', isLogged:0,username: "", categories:JSON.stringify(categories)});    
    }
}

exports.settings = async (req,res)=>{
    // const categories = await prisma.categories.findMany();

        res.render('settings1', { title: 'Settings',isLogged:1, username: req.session.userInfos[0].username, data:req.session.userInfos[0]});


}

exports.access_denied = async (req,res)=>{
    const categories = await prisma.categories.findMany();
    if(req.session.userInfos){
        res.render('access_denied', { title: 'Access denied',isLogged:1, username: req.session.userInfos[0].username, data:req.session.userInfos[0], categories:JSON.stringify(categories)});
    }else{
        res.render('access_denied', { title: 'Access denied',isLogged:0 ,username: "", categories:JSON.stringify(categories)});   
    }
}

exports.test = async(req, res) => {
    res.render('test');
}

exports.search = async(req, res) => {
    /*
    Code du search ici
    */
    const categories = await prisma.categories.findMany();
    if(req.session.userInfos){
        res.render('search', { title: 'Search',isLogged:1, username: req.session.userInfos[0].username, data:req.session.userInfos[0], categories:JSON.stringify(categories)});
    }else{
        res.render('search', { title: 'Search',isLogged:0 ,username: "", categories:JSON.stringify(categories)});   
    }
}

exports.create_channel = async(req, res) => {
    const categories = await prisma.categories.findMany();
    const room = await prisma.rooms.findMany({where:{id_user: req.session.userInfos[0].id}});
    if(room.length > 0){
        channel_name = "/channel/"+room[0].name;
    }else{
        channel_name = "/create";
    }
    if(req.session.userInfos){
        res.render('create_channel', { title: 'CREATE CHANNEL',isLogged:1, username: req.session.userInfos[0].username, data:req.session.userInfos[0], categories:JSON.stringify(categories),channel_name});
    }else{
        res.render('create_channel', { title: 'CREATE CHANNEL',isLogged:0 ,username: "", categories:JSON.stringify(categories),channel_name});   
    }
}


exports.postcreateChannel = async (req,res)=>{
    var title = req.body.title;
    var description = req.body.description;
    var twitter = req.body.twitter;
    var facebook = req.body.facebook;
    var instagram = req.body.instagram;
    var tiktok = req.body.tiktok;
    // var banner = req.file.name;
    var id_user = req.session.userInfos[0].id;
    var banner = "https://static.vecteezy.com/system/resources/previews/002/144/780/original/gaming-banner-for-games-with-glitch-effect-neon-light-on-text-illustration-design-free-vector.jpg";

    await prisma.rooms.create({ data: { ref: "abcdef", id_user: id_user, name: title,status: "active", name_category:"All" } });

    //insert into table social_media

    res.redirect('/channel/'+title+'');

}

