const readline = require('readline');
fs = require('fs')
var xmldoc = require('xmldoc');
 
var res = "";


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
  //console.log(node.children);
  if(node.children){
    node.children.forEach(child => {
      if(node.name != "rdf:Description"){
        exploreChild(child);
      }else{
        exploreDescription(child, context);
      }
    });
  }
}

function exploreDescription(node, context){
  //console.log(node.name)
  console.log(context);
  //console.log(JSON.stringify(monContext))
  console.log("-----------------------------------\n");
  context = JSON.parse(JSON.stringify(context))
  context = getContext(node,context);
  console.log(context);
  if(context['rdf:resource']){
    res+= context['rdf:about']+" a "+cleanup(context['rdf:resource']);

    res += " .\n";
  }else if(node.val && node.val !== ""){
    res+= context['rdf:about']+" "+cleanup(node.name)+' "'+cleanup(node.val)+'"';

    if(context["xml:lang"]){
      res+="@"+context["xml:lang"];
    }

    res += " .\n";
  }
  console.log("======================================================\n");
}

function openFile(path, callback){
  fs.readFile(path, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    var document = new xmldoc.XmlDocument(data);
    //console.log(document);
    exploreChild(document);

    if(typeof callback == "function") callback();

  });

  
}



openFile(process.argv[2],function(){
  console.log(res);
});


