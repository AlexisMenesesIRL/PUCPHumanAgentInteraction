const express = require("express");
const https = require('https');
const path = require('path')
const apps = new express();
const app = express();
const port = 5000;
const ports = 5433;
const fs = require('fs');
const ws = require('ws');

app.use('/', express.static(path.join(__dirname, 'public')))
apps.use('/', express.static(path.join(__dirname, 'public')))

apps.get("/usuario1", (req,res)=>{
  res.sendFile('public/SRTTS.html', { root: __dirname })
});

apps.get("/usuario2", (req,res)=>{
  res.sendFile('public/SRTTS.html', { root: __dirname })
});

let websocket_connections = {};

const websocketServer = new ws.Server({
  noServer: true,
  path: "/command",
});

const httpsserver = https.createServer({
  key: fs.readFileSync(__dirname+'\\ssl\\hai.key'),
  cert: fs.readFileSync(__dirname+'\\ssl\\hai.crt')
  }, apps).listen(ports);

const httpserver = app.listen(port, () => {
  console.log(`Mi primer servidor en nodejs en el puerto ${port}`)
})


websocketServer.on('connection',(socket,connectionRequest)=>{
    socket.on('open',function(){
        //console.log("openning... ");
    });       
    socket.on('message', (message)=>commandprocessor(message,socket));
    socket.on('close',function(){
      //console.log("closing...")
        //commandprocessor(JSON.stringify({label:"closewebrtc"}),socket);
        //console.log("server closed ");
    });
});

httpsserver.on("upgrade", (request, socket, head) => {
  websocketServer.handleUpgrade(request, socket, head, (websocket) => {
    websocketServer.emit("connection", websocket, request);
  });
});

httpserver.on("upgrade", (request, socket, head) => {
  websocketServer.handleUpgrade(request, socket, head, (websocket) => {
    websocketServer.emit("connection", websocket, request);
  });
});



function commandprocessor(message,socket){
  let received_data = safelyParseJSON(message);
  if(received_data.registro)
    websocket_connections[received_data.registro] = socket;
  
  switch(received_data.command){
    case "send_message":
          for(websocketconnection in websocket_connections){
            if(websocketconnection!==received_data.usuario){
              websocket_connections[websocketconnection].send(JSON.stringify(received_data))
            }
          }
    break;

  }


}


const safelyParseJSON = (json) => {
  let parsed = "";

  try {
    parsed = JSON.parse(json);
  } catch (e) {
    console.trace("there is an error on JSON: " + json);
  }

  return parsed;
}


