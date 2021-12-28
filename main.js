var Discord=require("discord.js");
var client=new Discord.Client();
var fs=require("fs");
var cp=require("child_process");
client.on("ready",()=>{
  console.log(`Logged in as ${client.user.tag}!`);
});
var retrieve=function(minrule,maxrule,p,labels){
  var config={minrule:minrule,maxrule:maxrule,p:p,labels:labels};
  fs.writeFileSync("./config.json",JSON.stringify(config));
  cp.execSync("node retrieve.js > results.json");
  var results=JSON.parse(fs.readFileSync("./results.json","utf-8"));
  return results;
};
var messagequeue=[];
setInterval(function(){
  if(messagequeue.length===0){
    return;
  }
  var item=messagequeue.pop();
  var text=item.text;
  var channel=item.channel;
  channel.send(text);
},1200);//For once asynchronous is useful
var addtoqueue=function(entry,channel){
  var items=[];
  for(var i=0;i<entry.length;i++){
    var item={text:entry[i],channel:channel};
    items.push(item);
  }
  messagequeue=items.concat(messagequeue);
};
client.on("message",msg=>{
  if(msg.content.substring(0,9)!=="s.search "){
    return;
  }
  try{
    var parameters=msg.content.substring(9);
    parameters=JSON.parse(parameters);
    var results=retrieve(parameters.minrule,parameters.maxrule,parameters.p,parameters.labels);
    for(var i=0;i<results.length;i++){
      var result=results[i];
      addtoqueue(result,msg.channel);
    }
  }catch(e){
    addtoqueue([e.message],msg.channel);
  }
});
client.login("token");
