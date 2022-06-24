var mysql = require("mysql");
var dotenv = require("dotenv");
dotenv.config({ path: " .././.env" });
var path = require("path");
const url = require("url");
const fetch = require("node-fetch");
var axios = require("axios");
// public foldeer
var app = require(".././app.js");
var express = require("express");
// JWT for tokens
// ORM Prisma
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// to hash the password
const byrpt = require("bcryptjs");

// videSdk

var jwt = require("jsonwebtoken");
var uuid4 = require("uuid4");

// Need to generate from app.videosdk.live


function getToken(){
  const API_KEY = process.env.VIDEOSDK_API_KEY;
  const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;
  const options = { expiresIn: "10m", algorithm: "HS256" };
  const payload = {
    apikey: API_KEY,
  };
  const token = jwt.sign(payload, SECRET_KEY, options);
  return token
}


exports.generateToken = async function (req, res) {
  const API_KEY = process.env.VIDEOSDK_API_KEY;
  const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;
  const options = { expiresIn: "10m", algorithm: "HS256" };
  const payload = {
    apikey: API_KEY,
  };
  const token = jwt.sign(payload, SECRET_KEY, options);
  return res.json({ token });
};

exports.meetings = async (req,res)=>{
  const categories = await prisma.categories.findMany();

  if(req.session.userInfos){
      res.render('test', { title: 'Meeting', isLogged: 1, username: req.session.userInfos[0].username, categories:JSON.stringify(categories)});
  }else{
      res.render('test', { title: 'Meeting', isLogged: 0,username: "", categories:JSON.stringify(categories)});
  }    
}


exports.liveStream = async function (req, res) {
  const {title,category} = req.body;
  // generate token
  const API_KEY = process.env.VIDEOSDK_API_KEY;
  const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;
  const options = { expiresIn: "10m", algorithm: "HS256" };
  const payload = {
    apikey: API_KEY,
  };
  const token = jwt.sign(payload, SECRET_KEY, options);
  

  try {
    var data = JSON.stringify({
      name: title,
      record: true,
      restream: [
        {
          url: "rtmp://x.rtmp.youtube.com/live2",
          streamKey: "0tjp-h6a2-8c9d-vusv-01uu",
        },
      ],
    });

    var config = {
      method: "post",
      url: "https://api.videosdk.live/v1/livestreams",
      headers: {
        Authorization:token,
        "Content-Type": "application/json",
      },
      data: data,
    };

    var resp = {}
    await axios(config)
      .then(function (response) {
        resp = Object.assign({}, response.data)
      })
      .catch(function (error) {
        console.log(error);
      });
      await prisma.videos.create({ data: { name:resp.name, date:resp.createdAt, status:"stream", ref_video:resp.downstreamUrl,ref_record:resp.recordingUrl,id_room:0} });

      await prisma.users.update({
        where: {
            email:req.session.userInfos[0].email ,
        },
        data: {
            server:"rtmp://live.videosdk.live/live",
            privateKey:resp.streamKey
        }
    })

      return res.render('live2',{"stream_key":resp.streamKey,"live_url":"rtmp://live.videosdk.live/live/",isLogged :1,username: req.session.userInfos[0].username});
  } catch (err) {
    console.log(err);
  }
};


exports.streams = async (req,res)=>{
  try{
    const streams = await prisma.videos.findMany();
    return res.json(streams)
  }
  catch(err){
    console.log(err)
  }
  
}

exports.vod = async (req,res)=>{

}
