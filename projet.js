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
  return string.replace(/(\r\n|\n|\r)/gm,"").trim();
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
      tmp = tmp.pop();

      //tmp = tmp[tmp.length-1];

      console.log(links);
      console.log("----------------------------------");

      if(links[tmp]){
        resource = links[tmp];
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
      
      var tmp = cleanup(context['rdf:resource']).split("/");
      tmp = tmp[tmp.length-1];
      links[tmp] = cleanup(context['rdf:resource']);
      res+= context['rdf:about']+" <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <"+cleanup(context['rdf:resource'])+">";

      res += " .\n";
    }
  }else if(node.val && node.val !== ""){
    res+= "<" + context['rdf:about']+"> "+ "<" + cleanup(node.name)+'> "'+cleanup(node.val)+'"';

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
    exploreChild(document);

    if(typeof callback == "function") callback();

  });

  
}



openFile(process.argv[2],function(){
  console.log(res);
});


