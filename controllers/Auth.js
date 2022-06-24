var mysql = require('mysql');
var nodeMailer = require('nodemailer');
var dotenv = require('dotenv');
dotenv.config({ path: ' .././.env' });
var path = require('path');
const url = require('url');   
const axios = require('axios').default;
// public foldeer
var app = require('../app.js')
var express = require('express');

var os = require("os");
var hostname = os.hostname();

// ORM Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()

// to hash the password
const byrpt = require('bcryptjs');
function sendEmails(to){
    var transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth: {
          user: "www.abdo2001@gmail.com",
          pass: "oferzimoduyqavji"
        }
      });
      
      var outpout = "<H2>Verify Your Account</H2>"+
                    "<h4>To access to your account your need to open the link below</h4>"+
                    "<a href='http://localhost:3000/signup/verify?user="+to+"&tk="+ Math.random().toString(36).substring(2,100)+ Math.random().toString(36).substring(2,100)+ Math.random().toString(36).substring(2,100)+ Math.random().toString(36).substring(2,100)+ Math.random().toString(36).substring(2,100)+ Math.random().toString(36).substring(2,100)+ Math.random().toString(36).substring(2,100)+"'>Verify Email</a>"
                    
      var mailOptions = {
        from: '"Forge Team" www.abdo2001@gmail.com',
        to: to,
        subject: "Account Verfication",
        html: outpout
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error + "not sended");
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }


exports.login = async (req,res)=>{
    // res.render('login', { title: 'Express' });
    res.render('login1', { title: 'Express',isLogged :0,username: ''});

}
exports.oauth = async (req, res) => {
    const { email, password, username } = req.body;
    
    try {
        const passwordOfThisEmail = await prisma.users.findMany({
            where: {
                OR: [
                    {
                        email: email,
                    },
                    {
                        username: username
                    },
                ]
            }
        })
       
        if (passwordOfThisEmail[0] != null) {
            byrpt.compare(password, passwordOfThisEmail[0].password).then(async (result) => {
                if (result === true) {
                    const UserInfo = await prisma.users.findMany({
                        where: {
                            OR: [
                                {
                                    email: email,
                                },
                                {
                                    username: username
                                },
                            ]
                        }
                    })
                    

                    /* session here */
                    if(passwordOfThisEmail[0].verified_email){
                        req.session.userInfos=UserInfo;
                        return res.redirect('/')
                    }
                    else{
                        return res.redirect(url.format({
                            pathname:"/login",
                            query:{
                                message:'You need to verify your email.'
                            }
                        }))
                    }
                    

                } else {
                    return res.redirect(url.format({
                        pathname:"/login",
                        query:{
                            message:'password is invalid'
                        }
                    }))
                }
            })
        }
        else {
            return res.redirect(url.format({
                pathname:"/login",
                query:{
                    message:"email or username doesn't exist"
                }
            }))
        }
    } catch (error) {
        console.log(error)
    }
}

exports.discord = async (req,res)=>{
    const {code}= req.query;
    if(code){
        try{
            const formdata = new url.URLSearchParams({
                client_id: '984180527785459802',
                client_secret:'SwRgf3_FhTEWssbHBF5A3cbXL6g3yA5q',
                grant_type:'authorization_code',
                code:code.toString(),
                redirect_uri:'http://localhost:3000/auth/api/discord/redirect',
            });
            console.log(formdata.toString())
            const response = await axios.post(
                'https://discord.com/api/v8/oauth2/token',
                formdata.toString(),
                {
                    headers:{
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },  
                }
            )
            const {access_token} = response.data;
            const {data : userResponse} = await axios.get('https://discord.com/api/v8/users/@me',
            {
                headers:{
                    'Authorization':`Bearer ${access_token}`,
                },
            })

            /* session here */ 
            // console.log(userResponse);
            email = userResponse.email;
            username = userResponse.username;
            const users = await prisma.users.findMany({ where: { email:email } });
            const userByUsername = await prisma.users.findMany({ where: { username } });

            if (users.length > 0) { 
            }
            else{
                await prisma.users.create({ data: { username, email: email, password: "",verified_email:true,state:"authorized" } });

                // await prisma.rooms.create({ data: { name:username, status: "active", name_category:"All" } });
                const Username1 = await prisma.users.findMany({ where: { username } });
                var id_user = Username1[0].id;
                try{
                    await prisma.rooms.create({ data: { ref: "abcdef", id_user:5, name: Username1[0].username,status: "active", name_category:"All" } });

                }
                catch(err){
                    console.log(err);
                }

            }
            
            const UserInfo = await prisma.users.findMany({
                where: {
                    OR: [
                        {
                            email: email,
                        }
                    ]
                }
            });
            req.session.userInfos = UserInfo;
            return res.redirect('/');
        }
        catch(err){
            return res.send(err)
        }
    }
    return res.send(req.query)
}

exports.google = async (req,res)=>{
    
}

exports.register = async (req,res)=>{
    // res.render('register', { title: 'Express' });
    res.render('register1', { title: 'Express' ,isLogged:0,username: ""});

}
exports.signup = async (req, res) => {

        
    
    const { email, username, password, confimPassword } = req.body;
    try {
        const users = await prisma.users.findMany({ where: { email:email } });
        const userByUsername = await prisma.users.findMany({ where: { username } });

        if (users.length > 0) { // check if the email already exist
            //return res.redirect('/login',{message:'email already exist!'});
            
            return res.redirect(url.format({
                pathname:"/register",
                query:{
                    message:'email already exist!'
                }
            }))
              
         
        }

        if (userByUsername.length > 0) { // check if the email already exist
            return res.redirect(url.format({
                pathname:"/register",
                query:{
                    message:'username already exist!'
                }
            }))
        }

        else if (password !== confimPassword) { // check if the password match
            return res.redirect(url.format({
                pathname:"/register",
                query:{
                    message:'password does not match!'
                }
            }))
        }
        

        // insert new account to database if all valid
        let passwordHashed = await byrpt.hash(password, 10);
        try{
            
            await prisma.users.create({ data: { username, email: email, password: passwordHashed } });
            sendEmails(email);
            // await prisma.rooms.create({ data: { name:username, status: "active", name_category:"All" } });

            const Username1 = await prisma.users.findMany({ where: { username } });
            var id_user = Username1[0].id;
            try{
                await prisma.rooms.create({ data: { ref: "abcdef", id_user:5, name:username,status: "active", name_category:"All" } });

            }
            catch(err){
                console.log(err);
            }

        }
        catch(err){ //
        console.log(err);
    }
        

        const UserInfo = await prisma.users.findMany({
            where: {
                OR: [
                    {
                        email: email,
                    }
                ]
            }
        });
        //req.session.userInfos = UserInfo;
        // const UserInfo = await prisma.users.findMany({
        //     where: {
        //         OR: [
        //             {
        //                 email: email,
        //             }
        //         ]
        //     }
        // });
        // req.session.userInfos = UserInfo;
        // create Token for the user
        return res.redirect('/login');

    } catch (error) {
        console.log(error)
    }
}

exports.verify = async (req,res)=>{
    try {
        const users = await prisma.users.findMany({ where: { email:req.query.user } });

        if (users.length > 0) { // check if the email already exist
            await prisma.users.update({
                where: {
                    email:req.query.user ,
                },
                data: {
                    verified_email:true,
                    state:"authorized"
                }
            })
            return res.json({ "res": "Email Verified Successfully" })
        }

    }
    catch (error) {
        console.log(error)
    }
    
}


exports.logout = async (req, res) => {
    //  const  jwToken  = req.header('jwToken');
    //  var tokenDecode  = jwt.decode(jwToken)

    // await prisma.users.update({
    //     where: {
    //         username : Object.values(tokenDecode)[0]
    //     },
    //     data: {
    //         isConnected: false,
    //     }
    // })
    req.session.destroy();
    res.redirect("/");
    // return res.send("redirect").status(200);
}




