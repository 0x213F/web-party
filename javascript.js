//
// Joshua Schultheiss (c) 2016
//

/* GLOBAL VARIABLES */

var file = { bool : false, cactus : 2, paired : false, username : "none", ip : "none" };
var lights; // TODO: store this in cache / multiple homes-hubs / delete data

/* MAIN FUNCTION CALLED ON PAGE LOAD */

function audioFileLoaded() {
	document.getElementById("main").innerHTML = "<div id=\"dancefloor\"></div><img src=\"bridge_v2.svg\" class=\"svg\" id=\"huebutton\"><div id=\"stopbutton\" title=\"Homepage\"><p>stop</p></div></a>";
	rave();
	get_ip();
	$('#stopbutton').on('click', function(){
			if ( file.bool == false) {
				document.getElementById("main").innerHTML = "<p>sorry</p>";
				document.body.style.backgroundColor = "#000";
				document.body.style.color = "#FFF";
				file.bool = true;
				document.getElementById("song").muted = true;
			}
	});
}

/* HELPER DISCO FUNCTION */

function rave() {

	// for party-poopers
	if(file.bool==true) return;

	// randomly generate colors
	var r = Math.ceil(Math.random()*255);
	var g = Math.ceil(Math.random()*255);
	var b = Math.ceil(Math.random()*255);
	var rNew, gNew, bNew;
	if ( r<= 127 ) rN = r+128;
	if ( r > 127 ) rN = r-128;
	if ( g<= 127 ) gN = r+128;
	if ( g > 127 ) gN = r-128;
	if ( b<= 127 ) bN = r+128;
	if ( b > 127 ) bN = r-128;
	var aColor = "rgb(" + r + "," + g + "," + b + ")";
	var bColor = "rgb(" + rN + "," + gN + "," + bN + ")";
	var dancer = "<br><br><br><br><br><br><h1><img src=\"c" + file.cactus%4 + ".jpeg\" class=\"cactus\">"
								 + "<img src=\"c" + (file.cactus+2)%4 + ".jpeg\" class=\"cactus\">"
								 + "</h1><h1>PARTY TIME</h1>"; // TODO: make this less ugly

	// update document style
	document.body.style.backgroundColor = bColor;
	document.body.style.color = bColor;
	document.getElementById("dancefloor").innerHTML= dancer;
	document.getElementById("dancefloor").style.backgroundColor= aColor;
	document.getElementById("huebutton").style.fill= bColor;
	document.getElementById("stopbutton").style.borderColor= bColor;

	// for phillips hue light integration
	if ( file.paired == true ) {
		for(light in lights) {
			color = Math.ceil(Math.random()*65535);
			hue(color,light);
		}
	}

	// repeat every eigth note on beat
	file.cactus = file.cactus + 1;
	setTimeout(function(){rave();}, /* CHANGE THIS NUMBER  ==> */ 341 /* <== CHANGE THIS NUMBER */);

}

/* PHILLIPS HUE FUNCTIONS */

function hue(color,light) {
  var website = "http://"+file.ip+"/api/"+file.username+"/lights/"+light+"/state";
  var data = {"transitiontime":0,"hue":""};
  data.hue = color;
  $.ajax({
    url: website,
    type: "PUT",
    data: JSON.stringify(data)
  });
}

function sat(light) {
  var website = "http://"+file.ip+"/api/"+file.username+"/lights/"+light+"/state";
  var data = {"transitiontime":0,"sat":254};
  $.ajax({
    url: website,
    type: "PUT",
    data: JSON.stringify(data)
  });
}

function get_ip() {
  var ip_url = "https://www.meethue.com/api/nupnp";
  $.ajax({
    async: false,
    url: ip_url,
    type: "GET"
  }).done(function (nupnp) {
    if(nupnp[0]!=undefined) {
      file.ip = nupnp[0].internalipaddress;
      get_username(0);
      //window.onload = function() {
				// TODO: add / remove icon if bridge is detected
      //};
      return;
    } // else {
		 //
		//}
    return;
  });
}

function get_username(n) {
	if( n > 240 ) return;
  var url = "http://" + file.ip + "/api";
  var body = {"devicetype":"party#web"};
  $.ajax({
    async: false,
    url: url,
    type: "POST",
    data: JSON.stringify(body)
  }).done(function (pairing) {
    if(pairing[0].error!=null) setTimeout(function(){get_username(n++)},500);
    if(pairing[0].success!=null) {
      file.username = pairing[0].success.username;
			get_lights();
      return;
    }
  });
}

function get_lights() {
	$.ajax({
    async: false,
    url: "http://"+file.ip+"/api/"+file.username+"/lights",
    type: "GET",
  }).done(function (devices) {
		lights = devices;
		file.paired = true;
		for(light in lights) {
			sat(light);
		}
		return;
	});
}
