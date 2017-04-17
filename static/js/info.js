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

var v = new Vue({
  el : "#app",
  data : {
    resArr : [0],
    downloadList : [],
  },
  created : function(){
    this.load(GetRequest()["token"],GetRequest()["id"]);
    loadP();
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
  }

})

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
          headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
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
}
