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
};


var vm = new Vue({
  el : "#app",
  data : {
    resArr : [0],
    downloadList : [],
  },
  watch : {

  },
  created : function(){
    this.load(GetRequest()["token"],GetRequest()["id"]);

    loadP();
    // jsmol();

  },
  ready : function(){
  },
  methods : {
    load : function(token,id){
      var hg = this.resArr
      // TODO: token 验证
      var loadString = "/m/info?id="+id;
      axios.get(loadString).then(function(response){
        hg.splice(0,1,response.data);
      }).catch(function(error){
        console.log(error);
      });
    },

    download : function(){
      var d1 = this.downloadList.indexOf("d1")>=0?1:0;
      var d2 = this.downloadList.indexOf("d2")>=0?1:0;
      var d3 = this.downloadList.indexOf("d3")>=0?1:0;
      var url = "/static/xyl/"+this.resArr[0].extract.poscar_static.system_name+"/"+this.resArr[0].extract.m_id+"/Static/test_scan/";
      if (d1===1) {
        window.open(url+"INCAR","_blank")
      }
      if (d2===1) {
        window.open(url+"POSCAR")
      }
      if (d3===1) {
        window.open(url+"KPOINTS")
      }
    },

    figure : function(number){
      return "/static/MIP/"+this.resArr[0].extract.m_id+"-bandStructure/figure_"+number+".png";
    }
  }

});

function loadP(){
  $('#container').highcharts({
      chart: {
          type: 'column'
      },
      title: {
          text: 'X-Ray'
      },
      subtitle: {
          text: '数据来源: MIP'
      },
      xAxis: {
          categories: [
              '10',
              '20',
              '30',
              '40',
              '50',
              '50'
          ],
          crosshair: true
      },
      yAxis: {
          min: 0,
          title: {
              // text: '降雨量 (mm)'
          }
      },
      tooltip: {
          headerFormat: '<span style="font-size:10px" v-prev>{point.key}</span><table v-pre>',
          pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true
      },
      plotOptions: {
          column: {
              pointPadding: 0.2,
              borderWidth: 0
          }
      },
      series: [{
          name: 'Fe',
          data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4]
      }]
  });
};

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
