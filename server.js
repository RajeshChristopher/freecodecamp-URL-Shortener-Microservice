require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns");
const urlparser = require("url");

const mongoose = require('mongoose');

const { MongoClient } = require('mongodb');
const mongourl = process.env.DBURL;
//const client = new MongoClient(mongourl, { useNewUrlParser: true, useUnifiedTopology: true });
//client.connect(err => {
  //const collection = client.db("urlshortener").collection("urls");
  // perform actions on the collection object
  //client.close();
//});
//mongoose.connect(mongourl,{useNewUrlParser:true,useUnifiedTopology:true})
//.then(() => {
//  console.log("CONNECTION OPEN!!")
//})
//.catch(err => {
//  console.log("OH NO ERROR!");
 // console.log(err)
//})
mongoose.connect(mongourl,{useNewUrlParser:true,useUnifiedTopology:true});
//mongoose.set("useFindAndModify", false);
//console.log(mongourl);

//var urlSchema = new mongoose.Schema({
  //urllink: String,
  //num: Number
//});

var urlSchema = new mongoose.Schema({
  original: {type:String,required:true},
  short: Number
});

var Url = mongoose.model("Url", urlSchema);

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

var responseObject = {};
app.post("/api/shorturl",bodyParser.urlencoded({extended: false}), function(req,res){
  var inputUrl = req.body["url"];
  console.log(inputUrl);

  var h = dns.lookup(urlparser.parse(inputUrl).hostname,function(err,addr){
    if(!addr){
      res.json({error: "Invalid Url"});
    }else{
  
  
  console.log(h);
  responseObject["original_url"] = inputUrl;

  var inputShort = 1 ;
  Url.findOne({})
    .sort({short: "desc"}).exec(function(error,result){
    if(!error && result != undefined){
      inputShort = result.short + 1;
    }
      if(!error){
        Url.findOneAndUpdate(
          {original: inputUrl},
          {original: inputUrl, short: inputShort},
          {new:true, upsert: true},
          function(error,savedUrl){
            if(!error){
              responseObject["short_url"] = savedUrl.short;
              res.json(responseObject);
            }
          }
        )
      }
  })
    }
    });
  
});

app.get("/api/shorturl/:input",function(req,res){
  var input = req.params.input;
  console.log(input);
  Url.findOne({short:input},function(error,result){
    if(!error && result!= undefined){
      res.redirect(result.original);
    }else{
      res.json("URL not found");
    }
  });
});

//app.post("/api/shorturl",function(req,res){
  //console.log(req.body);
 // const bodyUrl = req.body.url;
  //var n = 0;
 // const h = dns.lookup(url.parse(bodyUrl).hostname)
  //console.log(h);

  //const something = dns.lookup(urlparser.parse(bodyUrl).hostname,function(err,addr){
    //console.log(addr);
   // if(!addr){
    //  res.json({error: "Invalid URL"});
   // }else{
    //  const output = new Url({urllink: bodyUrl,num: n+1})
     // output.save(function(err,data){
        //console.log(data);
      //  res.json({
      //    original_url: data.urllink,
       //   short_url: data.num
        //});
      //});
    //}
  //});
//});

//app.get("/api/shorturl/:id",function(req,res){
  //const id =req.params.id;
  //console.log(id)
  //res.redirect(Url.urlllink);
  //Url.find(Url.num,function(err,data){
    //console.log(data);
    //if(err){
     // res.json({error: "Invalid URL"});
    //}else{
      //res.redirect(data.urlllink);
    //}
  //});
//});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
