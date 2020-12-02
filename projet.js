const readline = require('readline');
fs = require('fs')
var xmldoc = require('xmldoc');
 
var res = "";
var links = {};


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function cleanup(string){
  return string.replace(/(\r\n|\n|\r)/gm,"").replace(/\t/g, ' ').replace(/\s+/g," ").trim();
}

function getLinks(node){
  if(node.attr){
    for (const [key, value] of Object.entries(node.attr)) {
      var tmp = key.split(":");
      tmp = tmp[tmp.length-1];
      links[tmp] = value;
    }
  }
}

function getContext(node, context){
  if(node.attr){
    for (const [key, value] of Object.entries(node.attr)) {
      context[key] = value;
    }
  }

  return context;
}

function exploreChild(node, context = {}){
  //console.log(node.name)
  context = getContext(node,context);
  typeImpli = false;
  //console.log(node.children);
  if(node.name && node.name != "rdf:Description"){
    if(context['rdf:about']){

      
      resource = cleanup(node.name);
      var tmp = resource.split(":");

      if(links[tmp[0]]){
        resource = links[tmp[0]]+tmp[1];
      }

      res+= "<" + context['rdf:about']+"> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <"+resource+">";
      res += " .\n";
      typeImpli = true;
    }
  }

  if(node.children){
    node.children.forEach(child => {
      if(node.name != "rdf:Description" && !typeImpli){
        exploreChild(child,context);
      }else{
        exploreDescription(child, context);
      }
    });
  }
}

function exploreDescription(node, context){
  context = JSON.parse(JSON.stringify(context))
  context = getContext(node,context);
  if(context['rdf:resource']){

    if(cleanup(node.name) == "rdf:type"){
      
      resource = cleanup(context['rdf:resource']);

      res+= "<" + context['rdf:about']+"> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <"+resource+">";

      res += " .\n";
    }
  }else if(node.val && node.val !== ""){

    resource = cleanup(node.name);
    var tmp = resource.split(":");
    if(links[tmp[0]]){
      resource = links[tmp[0]]+tmp[1];
    }
    res+= "<" + context['rdf:about']+"> "+ "<" + resource+'> "'+cleanup(node.val)+'"';

    if(context["xml:lang"]){
      res+="@"+context["xml:lang"];
    }

    res += " .\n";
  }
}

function openFile(path, callback){
  fs.readFile(path, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var document = new xmldoc.XmlDocument(data);
    getLinks(document);
    exploreChild(document);

    if(typeof callback == "function") callback();

  });

  
}



openFile(process.argv[2],function(){
  console.log(res);
});


