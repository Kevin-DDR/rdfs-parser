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

function getContext(node, oldcontext){
  let context = Object.assign({}, oldcontext);
  if(node.attr){
    for (const [key, value] of Object.entries(node.attr)) {
      context[key] = value;
    }
  }

  return Object.assign({}, context);
}

function exploreChild(node, oldcontext = {}){
  let context = Object.assign({}, oldcontext);
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
      let newContext = Object.assign({}, context);
      if(child.name){
        if(node.name != "rdf:Description" && !typeImpli){
          exploreChild(child,newContext);
        }else{
          exploreDescription(child, newContext);
        }
      }
    });
  }
}

function exploreDescription(node, oldcontext){
  let context = getContext(node,oldcontext);
  if(context['rdf:resource']){
    resource = cleanup(context['rdf:resource']);
    if(cleanup(node.name) == "rdf:type"){
      console.log(context);
      console.log(node.name);
      console.log("--------------------------------");
      if(context['rdf:nodeID']){
        subject = "_:"+context['rdf:nodeID'];
      }else if(context['rdf:about']){
        subject = "<" + context['rdf:about']+">";
      }else{
        subject = "";
      }

      var tmp = resource.split(":");
      if(links[tmp[0]]){
        resource = links[tmp[0]]+tmp[1];
      }

      
      res+= subject+" <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <"+resource+">";
      res += " .\n";
    }else{
      subject = cleanup(node.name);
      var tmp = subject.split(":");
      if(links[tmp[0]]){
        subject = links[tmp[0]]+tmp[1];
      }

      res+= "<" + context['rdf:about']+"> <"+subject+"> <"+resource+">";
      res += " .\n";
    }
  }else if (node.name && context['rdf:nodeID']){

    subject = cleanup(node.name);
    var tmp = subject.split(":");
    if(links[tmp[0]]){
      subject = links[tmp[0]]+tmp[1];
    }
    
    resource = context['rdf:nodeID'];

    res+= "<" + context['rdf:about']+"> <"+subject+"> _:"+resource+"";
    res += " .\n";
  }else if(node.val && node.val !== ""){

    resource = cleanup(node.name);
    var tmp = resource.split(":");
    if(links[tmp[0]]){
      resource = links[tmp[0]]+tmp[1];
    }
    res+= "<" + context['rdf:about']+"> "+ "<" + resource+'> "'+cleanup(node.val)+'"';
    if(context["rdf:datatype"]){
      res+= "^^<"+context["rdf:datatype"]+">";
    }
    if(context["xml:lang"]){
      res+="@"+context["xml:lang"];
    }
    res += " .\n";
  }

  if(node.children){
    node.children.forEach(child => {
      let newContext = Object.assign({}, context);
      if(child.name){
        if(node.name != "rdf:Description" && !typeImpli){
          exploreChild(child,newContext);
        }else{
          exploreDescription(child, newContext);
        }
      }
    });
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


