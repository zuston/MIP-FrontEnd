function GetRequest(url){
  // var url = location.search; //获取url中"?"符后的字串
  var theRequest = new Object();
  if(url.indexOf("?") != -1)
  {
    var str = url.substr(1);
    var strs = str.split("&");
    for(var i = 0; i < strs.length; i ++)
      {
       theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
      }
  }
  return theRequest;
}

jQuery(document).ready(

function() {
var id = GetRequest(window.parent.location.search)["id"];
Info = {
	width: 400,
	height: 400,
	debug: false,
	j2sPath: "static/j2s",
	color: "0xC0C0C0",
  disableJ2SLoadMonitor: true,
  disableInitialConsole: true,
	addSelectionOptions: false,
	serverURL: "http://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
	use: "HTML5",
	script: "load /m/jsmol?id="+id,
  // script: "load /m/testjsmol",
  // script: "load http://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
	readyFunction: null
}

jQuery("#mydiv").html(Jmol.getAppletHtml("jmolApplet0",Info))

jQuery("#btns").html(
	Jmol.jmolButton(jmolApplet0, "spin on","spin ON")
 +Jmol.jmolButton(jmolApplet0, "spin off","spin OFF")
 )

}
);
