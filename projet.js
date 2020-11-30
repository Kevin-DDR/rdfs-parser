const readline = require('readline');
fs = require('fs')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class Requete{
  constructor(requete) {
    let words = requete.split(" ");
        
    this.sujet = words[0]
    this.predicat = words[1]

    let tmp = words;
    tmp.shift();
    tmp.shift();
    this.objet = tmp.join(" ");

    if(this.sujet.match("^\\?.*")){
      this.wildSujet = true;
      if(this.sujet.match("^\\?@.*")){
        this.hasAnnoSujet = true;
        let tmp = this.sujet.split("@")
        this.annoSujet = tmp[1]
      }
    }

    if(this.predicat.match("^\\?.*")){
      this.wildPredicat = true;
      if(this.predicat.match("^\\?@.*")){
        this.hasAnnoPredicat = true;
        let tmp = this.predicat.split("@")
        this.annoPredicat = tmp[1]
      }
    }

    if(this.objet.match("^\\?.*")){
      this.wildObjet = true;
      if(this.objet.match("^\\?@.*")){
        this.hasAnnoObjet = true;
        let tmp = this.objet.split("@")
        this.annoObjet = tmp[1]
      }
    }
  }
}

function openFile(path){
  fs.readFile(path, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    const dom = new JSDOM(data);
    console.log(dom);

  });
}



openFile(process.argv[2]);

