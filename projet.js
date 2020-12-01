const readline = require('readline');
fs = require('fs')
var xmldoc = require('xmldoc');
 
var res = "";


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function exploreChild(node){
  //console.log(node.name)
  var sujet = "";
  if(node.name == "rdf:Description"){
    console.log("Description !!!");
    sujet = node.attr['rdf:about'];
  }
  //console.log(node.children);
  if(node.children){
    node.children.forEach(child => {
      if(sujet == ""){
        exploreChild(child);
      }else{
        exploreDescription(child, sujet);
      }
    });
  }
}

function exploreDescription(node, sujet){
  //console.log(node.name)
  if(node.val && node.val !== ""){
    res+= sujet+" "+node.name.replace(/(\r\n|\n|\r)/gm,"").trim()+" "+node.val.replace(/(\r\n|\n|\r)/gm,"").trim();

    if(node.attr["xml:lang"]){
      res+="@"+node.attr["xml:lang"];
    }

    res += " .\n";
    //console.log(res);
  }
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


