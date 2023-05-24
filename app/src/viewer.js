import TokenSimulationModule from '../../lib/viewer';

import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';

import fileDrop from 'file-drops';

import fileOpen from 'file-open';

import exampleXML from '../resources/example.bpmn';


const url = new URL(window.location.href);

const persistent = url.searchParams.has('p');
const active = url.searchParams.has('e');
const presentationMode = url.searchParams.has('pm');

const initialDiagram = (() => {
  try {
    return persistent && localStorage['diagram-xml'] || exampleXML;
  } catch (err) {
    return exampleXML;
  }
})();

function hideMessage() {
  const dropMessage = document.querySelector('.drop-message');

  dropMessage.style.display = 'none';
}

function showMessage(cls, message) {
  const messageEl = document.querySelector('.drop-message');

  messageEl.textContent = message;
  messageEl.className = `drop-message ${cls || ''}`;

  messageEl.style.display = 'block';
}

if (persistent) {
  hideMessage();
}

const ExampleModule = {
  __init__: [
    [ 'eventBus', 'bpmnjs', 'toggleMode', function(eventBus, bpmnjs, toggleMode) {

      if (persistent) {
        eventBus.on('commandStack.changed', function() {
          bpmnjs.saveXML().then(result => {
            localStorage['diagram-xml'] = result.xml;
          });
        });
      }

      if ('history' in window) {
        eventBus.on('tokenSimulation.toggleMode', event => {

          if (event.active) {
            url.searchParams.set('e', '1');
          } else {
            url.searchParams.delete('e');
          }

          history.replaceState({}, document.title, url.toString());
        });
      }

      eventBus.on('diagram.init', 500, () => {
        toggleMode.toggleMode(active);
      });
    } ]
  ]
};

const viewer = new BpmnViewer({
  container: '#canvas',
  additionalModules: [
    ExampleModule,
    TokenSimulationModule
  ],
  keyboard: {
    bindTo: document
  }
});

var autoInterval;
var autoOn = false;
var tokens = 0;

function changeDirection(){
  document.querySelectorAll('[title="Set Sequence Flow"]')[0].click();
  setTimeout(changeDirection, Math.random()*2000+1000);
}

function autoTrigger(){
  if(!autoOn){
    tokens=0;
    autoInterval = setInterval(_ => {
      if(Math.random() < document.getElementById('lambda').value/10/60){
        document.querySelector('.bts-context-pad').click();
        tokens++;
        if(tokens > document.getElementById('tokens').value) {
          clearInterval(autoInterval);
          document.getElementById('svgauto').innerHTML = `<path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path>`;
          autoOn = false;
        }
      }
    }, 100);
    setTimeout(changeDirection, Math.random()*2000+1000);
    
    setInterval(_ => { 
      if(!document.querySelectorAll('.bts-context-pad')[28].classList.contains('hidden') && Math.random() < 0.25){
        document.querySelectorAll('.bts-context-pad')[28].click()
      }
      if(!document.querySelectorAll('.bts-context-pad')[11].classList.contains('hidden') && Math.random() < 0.25){
        document.querySelectorAll('.bts-context-pad')[11].click()
      }
      if(!document.querySelectorAll('.bts-context-pad')[14].classList.contains('hidden') && Math.random() < 0.25){
        document.querySelectorAll('.bts-context-pad')[14].click()
      }
      if(!document.querySelectorAll('.bts-context-pad')[15].classList.contains('hidden') && Math.random() < 0.25){
        document.querySelectorAll('.bts-context-pad')[15].click()
      }
      if(!document.querySelectorAll('.bts-context-pad')[16].classList.contains('hidden') && Math.random() < 0.25){
        document.querySelectorAll('.bts-context-pad')[16].click()
      }
      if(!document.querySelectorAll('.bts-context-pad')[35].classList.contains('hidden') && Math.random() < 0.1){
        document.querySelectorAll('.bts-context-pad')[35].click()
      }
      if(!document.querySelectorAll('.bts-context-pad')[33].classList.contains('hidden') && Math.random() < 0.1){
        document.querySelectorAll('.bts-context-pad')[33].click()
      }
      if(!document.querySelectorAll('.bts-context-pad')[34].classList.contains('hidden') && Math.random() < 0.1){
        document.querySelectorAll('.bts-context-pad')[34].click()
      }
    }, 500);

    document.getElementById('svgauto').innerHTML = `<path fill="currentColor" d="M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"></path>`;
    
    autoOn = true;
  }else{
    clearInterval(autoInterval);
    autoOn = false;
    document.getElementById('svgauto').innerHTML = `<path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path>`;

  }  
}

function openDiagram(diagram) {
  return viewer.importXML(diagram)
    .then(({ warnings }) => {
      if (warnings.length) {
        console.warn(warnings);
      }

      if (persistent) {
        localStorage['diagram-xml'] = diagram;
      }

      viewer.get('canvas').zoom('fit-viewport');
      document.querySelector('.bts-palette').innerHTML += "<b>Auto simulation</b><br />"
      document.querySelector('.bts-palette').innerHTML += 'Tokens: <input type="number" id="tokens" style="width: 3em" value=30 /><br />'
      document.querySelector('.bts-palette').innerHTML += 'Lambda: <input type="number" id="lambda" style="width: 3em" value=60 /><br />'
      document.querySelector('.bts-palette').innerHTML += '<div class="bts-entry" id="autoTriggerBtn" title="Play/Pause Auto"><span class="bts-icon "><svg id="svgauto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path></svg></span></div>';
      document.getElementById('autoTriggerBtn').addEventListener('click', autoTrigger);
      
      var visited = {};
      document.querySelectorAll('.djs-overlays').forEach((val, ind) => {
          val.id = "block" + ind;
          visited[val.id] = [];
      })

    })
    .catch(err => {
      console.error(err);
    });
}

/*

<div class="djs-overlay djs-overlay-token-count" data-overlay-id="ov-894347311-38" style="position: absolute; left: 80px; top: -10px; transform-origin: left top;"><div class="bts-token-count-parent">
      
    <div data-scope-id="04ugf6p" class="token-counter" style="color: #fff; background: #2287f9">
      1
    </div>
  
    </div></div>
    
*/



if (presentationMode) {
  document.body.classList.add('presentation-mode');
}

function openFile(files) {

  // files = [ { name, contents }, ... ]

  if (!files.length) {
    return;
  }

  hideMessage();

  openDiagram(files[0].contents);
}

document.body.addEventListener('dragover', fileDrop('Open BPMN diagram', openFile), false);

document.body.addEventListener('keydown', function(event) {
  if (event.code === 'KeyO' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();

    fileOpen().then(openFile);
  }
});


const remoteDiagram = url.searchParams.get('diagram');

if (remoteDiagram) {
  fetch("http://modelowanie.jkostecki.pl/diagrams/"+remoteDiagram, {cache: "no-store"}).then(
    r => {
      if (r.ok) {
        return r.text();
      }

      throw new Error(`Status ${r.status}`);
    }
  ).then(
    text => openDiagram(text)
  ).catch(
    err => {
      showMessage('error', `Failed to open remote diagram: ${err.message}`);

      openDiagram(initialDiagram);
    }
  );
} else {
  openDiagram(initialDiagram);
}