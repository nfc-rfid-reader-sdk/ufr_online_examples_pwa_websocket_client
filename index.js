const UI_SIGNAL = 0x26;
const CARD_ID_EX = 0x2C;
const NO_CARD = 0x08;



window.addEventListener('load', () => {
  registerSW();
});

async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./sw.js');
    } catch (e) {
      console.log(`SW registration failed`);
    }
  }
}

var ws;
var uidLoopInterval;
let connectButton = document.getElementById('connect');
let disconnectButton = document.getElementById('disconnect');
let beepButton = document.getElementById('beep');
let getuidButton = document.getElementById('getuid');

connectButton.addEventListener('click', function() {
    connect();
});

disconnectButton.addEventListener('click', function() {
    disconnect();
});

beepButton.addEventListener('click', function() {
    beep();
});

getuidButton.addEventListener('click', function() {
    get_uid();
});

function connect() {
    var address = document.getElementById("address").value;
    ws = new WebSocket(address);
    ws.binaryType = 'arraybuffer';
    ws.onopen = function() {
        console.log('Websocket is connected ...')
        document.getElementById("status").innerHTML = "Status: Connected";
        get_uid_loop();

    }

    ws.onclose = function() {
        console.log('Websocket is disconnected ...')
        document.getElementById("status").innerHTML = "Status: Disconnected";
        clearInterval(uidLoopInterval);

    }

    ws.onmessage = function(ev) {

        var uint8Array = new Uint8Array(ev.data);
        const array = Array.from(uint8Array);
        handleResponse(array);
    }

}

function handleResponse(response)
{
    var func  = response[1];

    console.log(response);
    if(func == UI_SIGNAL)
    {

    }
    else if(func == CARD_ID_EX)
    {
        console.log("CARD ID");
        if(response[0]==0xDE)
        {
            let uid_len = response[5];
            let uid = '';
            for (var i = 0; i < uid_len; i++) {
                var hex = (response[7+i] & 0xff).toString(16);
                hex = (hex.length === 1) ? '0' + hex : hex;
                uid += hex;
            }
            document.getElementById("uid").innerHTML = "UID: " + uid.toUpperCase();
        }    
      
    }
    else if(func == NO_CARD)
    {
        document.getElementById("uid").innerHTML = "NO CARD";

    }
}


function disconnect() {
   ws.close();
}


function beep()
{
	var command = new Uint8Array(7);
    command[0] = 0x55;
    command[1] = 0x26;
    command[2] = 0xAA;
    command[3] = 0x00;
    command[4] = 0x01;
    command[5] = 0x01;
    command[6] = 0xe0;
	ws.send(command.buffer);
	
	
}

function get_uid()
{	
	var command = new Uint8Array(7);
    command[0] = 0x55;
    command[1] = 0x2C;
    command[2] = 0xAA;
    command[3] = 0x00;
    command[4] = 0x00;
    command[5] = 0x00;
    command[6] = 0xDA;
    ws.send(command.buffer);	
}

function get_uid_loop()
{
	
  uidLoopInterval =  setInterval(function() {
		get_uid();
  }, 250);
}

function byteToHexString(uint8arr) {
    if (!uint8arr) {
        return '';
    }

    var hexStr = '';
    for (var i = 0; i < uint8arr.length; i++) {
        var hex = (uint8arr[i] & 0xff).toString(16);
        hex = (hex.length === 1) ? '0' + hex : hex;
        hexStr += hex;
    }

    return hexStr.toUpperCase();
}