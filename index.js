const express = require('express')
const cors = require('cors')
const bodyparser = require('body-parser')
const mongoose = require("mongoose")
const mqtt = require('mqtt')
const fetch = require('node-fetch');
var app = express()
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended: true}))
app.use(cors())
const url ="mongodb://localhost:27017/Loraiot"

app.listen(3001,()=>{
  console.log('listen port on 3001')
})

mongoose.connect("mongodb://localhost:27017/Loraiot",{useNewUrlParser: true})
// get reference to database
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));


const SmartCitySchema = new mongoose.Schema({
  temp:Number,
  hum:Number,
  detect:Number,
  light:Number,
  time:String
},{versionKey:false})

const Smartcity = mongoose.model("smartcity",SmartCitySchema)


var config = {};
config.mqtt ={};
config.timeout = 120 *1000;

config.mqtt.options = {
  broker: "104.199.215.165",
  reconnectPeriod: 1000,
  port:1883,
  username:"nthuhsnl_lora",
  password:"89957463"
};
config.mqtt.topic="#"
config.mqtt.retain = true;
var client = mqtt.connect("mqtt://104.199.215.165",config.mqtt.options)

client.on("connect",()=>{
  client.subscribe(config.mqtt.topic);
  console.log("[MQTT]:","Connected.");
});

client.on("message",(topic,message)=>{
  // console.log(message.toString());
  // console.log(typeof(message.toString()))

  
  
  // console.log(message.toString());
  if(message.toString()!='cscsc3'){
    // console.log('no cscsc3')
    // console.log(message.toString());
  
  // console.log(obj)
  // console.log(typeof(obj))
  // console.log(obj[0]['gwid'])
  var obj= JSON.parse(message.toString())
  // console.log(obj)
  gwid = obj[0]['gwid']
  if(gwid != '0000f835ddfd5639'){
    
    Time = obj[0]['time']
    data = obj[0]['data']
    inmacaddress = obj[0]['macAddr']

    if(inmacaddress=='00000000aa2c67bb')
    {
      // console.log('time:',Time)
      console.log('data:',data)
      console.log('Time',Time)

      
      var airtemp = data.toString().substring(0,2)+'.'+data.toString().substring(2,4)
      var airhum  = data.toString().substring(4,6)+'.'+data.toString().substring(6,8) 
      var Light = data.toString().substring(8,10)
      var Detect = data.toString().substring(10,12)
      
      

      const smartcitydata = new Smartcity({
        temp:airtemp,
        hum:airhum,
        time:Time,
        detect:Detect,
        light:Light
    
      });
      smartcitydata.save();
    }
  }
}
})


app.get('/get/data',(req,res)=>{

  mongoose.connect(url,function(err,db){
    if(err)
     res.send(err);

     const collection = db.collection('smartcities');
      
     collection.find({}).toArray((err,documents)=>{
        if(err)
          res.send(err);
         else {
          
          res.send(documents);
          
         }
     });
  });
    
})

app.get('/get/onedate',(req,res)=>{
  var start = new Date();
  start.setHours(0,0,0,0);

  var end = new Date();
  end.setHours(23,59,59,999);
  // console.log(start.toISOString().split('.')[0] )
  mongoose.connect(url,function(err,db){
    if(err)
      res.send(err);

    const collection = db.collection('smartcities');
    collection.find({"time":{$gte:start.toISOString().split('.')[0],$lt:end.toISOString().split('.')[0]}}).toArray((err,documents) => {
      if(err)
        res.send(err);
      else{
        res.send(documents);
      }

    })
  })
})


app.get('/get/newdata',(req,res)=>{

  mongoose.connect(url,function(err,db){
    if(err)

     res.send(err);

     const collection = db.collection('smartcities');
     collection.find().limit(1).sort({$natural:-1}).toArray((err,documents)=>{
       if(err)
       res.send(err);
       else{
         console.log(documents)
         res.send(documents);
       }
     })
     
  });
    
})

app.get('/get/tendata',(req,res)=>{

  mongoose.connect(url,function(err,db){
    if(err)
     res.send(err);

     const collection = db.collection('smartcities');
     collection.find().limit(10).sort({$natural:-1}).toArray((err,documents)=>{
       if(err)
       res.send(err);
       else{
         res.send(documents);
       }
     })
     
  });
    
})

app.get('/get/opendata',(req,res)=>{

  var tempweather = []
    // https://works.ioa.tw/weather/api/doc/index.html
    fetch('https://works.ioa.tw/weather/api/cates/1.json',{method:"get"}).then((response)=>{
      return response.json()
    }).then((data)=>{
      // console.log(data.towns)
      var count = 0
      data.towns.forEach(element =>{
       
        fetch(`https://works.ioa.tw/weather/api/weathers/${element.id}.json`,{method:"get"}).then((response)=>{
              return response.json()
        }).then((data)=>{
          var temp = {}
          temp['id']=element.id
          temp['position'] = element.position 
          temp['data']=data
          temp['name']=element.name
          tempweather.push(temp)
          
          // console.log(tempweather)
          
          count=count+1
          // console.log(count)
          if(count === 12){
            // console.log('hi')
            // console.log(tempweather)
            res.send(tempweather)
          }
        })
        
      })
      
      
      
      
    })
    
})


app.get('/',(req,res)=>{
  
  res.sendFile('/Users/xuqidiao/Desktop/iotproject/index.html')
})




