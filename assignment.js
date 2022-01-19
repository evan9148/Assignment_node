const express = require("express");
const app = express();
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
let cookieParser = require('cookie-parser');
app.use(cookieParser())
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const port = 5000;


var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        password: 'Navgurukul123#@!',
        database: 'application_models'
    },
});


knex.schema.hasTable("user_details").then((value) => {
    if (!value){
        return knex.schema.createTable("user_details " , (table) => {
            table.increments("id").primary().unique(),
            table.string("username",100),
            table.string("contact_number", 255),
            table.string("password",100),
            table.datetime("create_date_time").defaultTo(knex.fn.now())
        }) 
    }
});


app.post("/Create", (req,res) => {
    knex.select('username').from('user_details').where('username', req.body.username)
    .then(async (data) => {
        if (data.length > 0){
            for (var i=0; i<data.length; i++){
                if (data[i]["username"] === req.body.username){
                    res.send("your email allready used...  ")
                    console.log("your email allready used...  ")
                } 
            }
        } else {
            if (data.length === 0) {
                var convert = req.body.password
                var Stringvalue = convert.toString()
                const salt = await bcrypt.genSalt(10);
                console.log(salt)
                console.log(typeof(Stringvalue))
                let value = await bcrypt.hash(Stringvalue,salt)
                console.log(req.body)
                knex("user_details")  
                    .insert({
                            username : req.body.username,
                            contact_number : req.body.contact_number,
                            password : value
                        })
                        .then(() => {
                            console.log("your details are created.... ")
                            res.send("your details are created.... ")
                        }).catch((error) => {
                            console.log(error)
                            res.send(error)
                        })
            }
        }
    }).catch((error) => {
        console.log(error)
        res.send(error)
    })
})



app.get("/Allusers" , (req,res) => {
    knex.select("*").from("user_details")
    .then((data) => {
        console.log(data)
        res.send(data)
    }).catch((err) => {
        console.log("ERROR...................")
        res.send(err)
    })
})



app.post("/login" , async (req,res) => { 
    console.log(req.body.username, " username....")
    console.log(req.body.password)
    knex.select("username","password").from("user_details").where("username" , req.body.username)
    .then((data) => {
        console.log(data)
        if (data.length > 0){
            bcrypt.compare(req.body.password, data[0].password,  function(err, result) {
                jwt.sign({ user: data }, "secret_key", (err, token) => {
                    res.cookie('token',token);
                    res.json(
                        "Auth successful"
                    );
                });
                console.log(result)
            });
        }else if (data.length === 0){
                console.log("Invaild email or password...! ")
                res.send("Invaild email or password...!   ")
        }
    })
    .catch((err) => {
        console.log(err)
        res.send(err)
    })
});



app.post("/verifyJWT" , (req,res) => {
    console.log(req.body)
    const user_token = req.cookies.token
    console.log(user_token,"????")
    jwt.verify(user_token, "secret_key", (err, authData) => {
        console.log(authData)
        if (err) {
            res.sendStatus(403);
            console.log(err)
        }else {
            res.status(201).json({
                verified : authData
            })
        }
    })
});



app.delete("/delete", (req,res) => {
    knex("user_details")
        .del()
        .then(() => {
            console.log("your data have deleted...  ")
            response.send("your data have deleted!...   ")
        })
        .catch((failed) => {
            console.log("not yet deleted...  ")
            response.send(failed)
        })
})



app.listen(port, () => {
    console.log(`Your server port is running ${port}`)
})