//importing
import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
// app config
const app = express()
const port = process.env.PORT || 9000

const pusher = new Pusher({
  appId: "1536198",
  key: "b896204ee12c52914397",
  secret: "fa2b64de0fc14011961f",
  cluster: "ap2",
  useTLS: true
});

// middleware
app.use(express.json());
app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Headers","*");
  next();
});
// db config
const url = "mongodb+srv://danishthomas:cy6MriT4RNiXr2Gs@cluster0.wdrrqug.mongodb.net/?retryWrites=true&w=majority"
mongoose.set('strictQuery', false);
mongoose.connect(url, {
   useNewUrlParser: true,
   useUnifiedTopology: true
});

const db = mongoose.connection;

db.once('open',()=>{
  console.log("DB Connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  changeStream.on('change',(change)=>{
    console.log(change);
    if(change.operationType === 'insert'){
      const messageDetails = change.fullDocument;
      pusher.trigger('message', 'inserted',
      {
        name: messageDetails.name,
        message: messageDetails.message,
      });
    } else{
      console.log("error in pusher");
    }
  })
})
//???
// node

// api route
app.get('/',(req,res)=> res.status(200).send('hello world'));

app.get('/api/v1/messages/sync',(req,res) =>{
  
Messages.find((err,data) =>{
    if(err){
      res.status(500).send(err)
    }else {
      res.status(200).send(data)
    }
  })
})

app.post('/api/v1/messages/new',(req,res) =>{
  const dbMessage = req.body

  Messages.create(dbMessage, (err,data) =>{
    if(err){
      res.status(500).send(err)
    }else {
      res.status(200).send(data)
    }
  })
})

// listener
app.listen(port,()=> console.log(`Listening on Localhost:${port}`));