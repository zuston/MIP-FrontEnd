var v = new Vue({
  el : "#app",
  created : function(){
    this.load();
    // jsmol();
  },
  methods:{
    load : function(token,id){
      axios.get("http://localhost:6699/MIP-FrontEnd/test.html?token=99&id=58a3f47f0095896a600fbd02").then(function(response){
      }).catch(function(error){
        console.log(error);
      });
    },
  }
});
function jsmol(){
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
  	script: "load /m/jsmol?id="+GetRequest()["id"],
    // script: "load http://chemapps.stolaf.edu/jmol/jsmol/php/jsmol.php",
  	readyFunction: null
  }

  jQuery("#mydiv").html(Jmol.getAppletHtml("jmolApplet0",Info))

  jQuery("#btns").html(
  	Jmol.jmolButton(jmolApplet0, "spin on","spin ON")
   +Jmol.jmolButton(jmolApplet0, "spin off","spin OFF")
   )
}


function GetRequest(){
  var url = location.search; //获取url中"?"符后的字串
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
