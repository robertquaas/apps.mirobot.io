var editor = new Editor('editor', 'controlBar', 'python');

//var builder = new Builder($('#code'), undefined, true);
var app  = new MirobotApp({
  l10n: true,
  languages: baseLanguages,
  simulation: true
});

editor.setMirobot(app.mirobot);

var interruptHandler = function (susp) {
  if (Sk.hardInterrupt === true) {
    throw new Sk.builtin.BaseException('aborted execution');
    editor.completeHandler();
  } else {
    return null; // should perform default action
  }
};

editor.onRun(function(prog){
  // set up an output function
  var outf = function (text) {
    if(! /^\s+$/g.test(text)){
      editor.printToConsole(text);
      console.log("Python: " + text);
    }
  };

  var builtinRead = function(x) {
      if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
          throw "File not found: '" + x + "'";
      return Sk.builtinFiles["files"][x];
  }
  
  Sk.configure({output: outf, read: builtinRead});
  window.__mirobot__ = app.mirobot;
  Sk.hardInterrupt = false;
  // Send the python to skulpt
  Sk.misceval.asyncToPromise(function() {
      return Sk.importMainWithBody("<stdin>",false,prog,true);
  }, {"*": interruptHandler}).then(function(a){
    editor.completeHandler();
  }).catch(function(e){
    editor.completeHandler();
    outf(e.toString());
  });
});

editor.onStop(function(){
  Sk.hardInterrupt = true;
});

app.initPersistence({
  saveHandler: function(){ return editor.saveProgram(); },
  loadHandler: function(prog){ return editor.loadProgram(prog); },
  clearHandler: function(){ return editor.clearProgram(); },
  fileType: 'js'
});