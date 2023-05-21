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

function autoTrigger(){
  if(!autoOn){
    tokens=0;
    autoInterval = setInterval(_ => {
      if(Math.random() < document.getElementById('lambda').value/10/60){
        document.querySelector('.bts-context-pad').click();
        tokens++;
        if(tokens > document.getElementById('tokens').value) {
          clearInterval(autoInterval);
          autoOn = false;
        }
      }
    }, 100);
    autoOn = true;
  }else{
    clearInterval(autoInterval);
    autoOn = false;
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
      document.querySelector('.bts-palette').innerHTML += 'Tokens: <input type="number" id="tokens" style="width: 3em" value=10 /><br />'
      document.querySelector('.bts-palette').innerHTML += 'Lamda: <input type="number" id="lambda" style="width: 3em" value=5 /><br />'
      document.querySelector('.bts-palette').innerHTML += '<div class="bts-entry" id="autoTriggerBtn" title="Play/Pause Auto"><span class="bts-icon "><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z"></path></svg></span></div>';
      document.getElementById('autoTriggerBtn').addEventListener('click', autoTrigger);
      
    })
    .catch(err => {
      console.error(err);
    });
}



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