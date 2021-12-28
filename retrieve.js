var db=require("./statorless.json");
var match=function(pruleL,pruleR){
  for(var i=0;i<16;i++){
    if(1*pruleL[i]+1*pruleR[i]===1){//Conflict between 0 and 1
      return false;
    }
  }
  return true;
};
var matchlist=function(prule,prulelist){
  for(var i=0;i<prulelist.length;i++){
    if(match(prule,prulelist[i])){
      return true;
    }
  }
  return false;
};
var rulerange=function(ruleL,ruleR){
  var prule="";
  for(var i=0;i<18;i++){
    var L=ruleL[i];
    var R=ruleR[i];
    if(L===R){
      prule+=L;
    }else{
      prule+="?";
    }
  }
  return prule;
};
var parse=function(rule){
  rule=rule.split("/");
  var B=rule[0].substring(1);
  var S=rule[1].substring(1);
  var Btxt=[0,0,0,0,0,0,0,0,0];
  var Stxt=[0,0,0,0,0,0,0,0,0];
  for(var i=0;i<B.length;i++){
    Btxt[1*B[i]]=1;
  }
  for(var i=0;i<S.length;i++){
    Stxt[1*S[i]]=1;
  }
  Btxt=Btxt.join("");
  Stxt=Stxt.join("");
  return Btxt+Stxt;
};
var matchp=function(pL,pR){
  if(pL===pR){
    return true;
  }
  if(pL*pR<0){//One of these will always be positive
    return true;
  }
  return false;
};
var matchlabels=function(labelslist,entrylabels){
  if(labelslist[0]==="any"){
    return true;
  }
  var o={};
  for(var i=0;i<entrylabels.length;i++){
    o[entrylabels[i]]=1;
  }
  for(var i=0;i<labelslist.length;i++){
    if(o[labelslist[i]]!==1){
      return false;
    }
  }
  if(labelslist.length===0){
    return false;
  }
  return true;
}
var search=function(minrule,maxrule,p,labels){
  minrule=parse(minrule);
  maxrule=parse(maxrule);
  var prule=rulerange(minrule,maxrule);
  if(prule[0]==="1"||prule[1]==="1"){
     return [];
  }
  prule=prule.substring(2);
  var results=[];
  for(var i=0;i<db.length;i++){
    var entry=db[i];
    var entryrulelist=entry.rules;
    if(matchlist(prule,entryrulelist)&&matchp(p,entry.p)&&matchlabels(labels,entry.labels)){
      results.push(entry);
    }
  }
  return results;
};
var makeRLE=function(entry,rule){
  var RLE="";
  RLE+="#C Minrule: "+entry.minrule+"\n";
  RLE+="#C Maxrule: "+entry.maxrule+"\n";
  RLE+="#C P"+entry.p+"\n";
  RLE+="x=0,y=0,rule="+rule+"\n";
  RLE+=entry.rle;
  return RLE;
};
var splitRLE=function(RLE){
  var split=[];
  var i=0;
  while(i<RLE.length){
    split.push(RLE.substring(i,i+2000));
    i+=2000;
  }
  return split;
};
var makeRLEs=function(minrule,maxrule,p,labels){
  var entries=search(minrule,maxrule,p,labels);
  var RLEs=[];
  for(var i=0;i<entries.length;i++){
    var RLE=makeRLE(entries[i],minrule);//This is arbitrary, as is pretty much any other choice.
    RLEs.push(splitRLE(RLE));
  }
  return RLEs;
};
var config=require("./config.json");
var minrule=config.minrule;
var maxrule=config.maxrule;
var p=config.p;
var labels=config.labels;
console.log(JSON.stringify(makeRLEs(minrule,maxrule,p,labels)));