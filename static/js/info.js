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

function generateRandom(){
  return Math.ceil(Math.random()*1000);
}


var vm = new Vue({
  el : "#app",
  data : {
    resArr : [0],
    downloadList : [],
    picExsitFlag : [true],

    //实践看看角标的生成
    numberArr : [],
    elementArr : [],

    highchartUrl:[],
    highchartUrl1:[],
    highchartUrl2:[],
    highchartUrl3:[],
    highchartUrl4:[],
    highchartFlag:false,
    // 图片展示 tag
    isShowPic:[true],

    jsmolHtml:[],

    lock : true,

    // 登录信息
    userInfo : []
  },
  watch : {

  },
  created : function(){
    this.highchartFlag=true
    this.load(GetRequest()["token"],GetRequest()["id"]);
    // this.initHighchartsUrl();
  },

  mounted : function(){

  },
  methods : {

    initHighchartsUrl:function(){
      setTimeout("",5000)
      this.highchartUrl="http://202.120.121.199:8083/MIP/page/highCharts.html?extract_id="+GetRequest()["id"]+"&uid="+generateRandom();
      if (this.isShowPic[0]) {
        setTimeout("",5000)
        this.highchartUrl1="http://202.120.121.199:8083/MIP/page/TPPTypeChart.html?extract_id="+GetRequest()["id"]+"&uid="+generateRandom();
        setTimeout("",5000)
        this.highchartUrl2="http://202.120.121.199:8083/MIP/page/TPNTypeChart.html?extract_id="+GetRequest()["id"]+"&uid="+generateRandom();
        setTimeout("",5000)
        this.highchartUrl3="http://202.120.121.199:8083/MIP/page/PFPTypeChart.html?extract_id="+GetRequest()["id"]+"&uid="+generateRandom();
        setTimeout("",5000)
        this.highchartUrl4="http://202.120.121.199:8083/MIP/page/PFNTypeChart.html?extract_id="+GetRequest()["id"]+"&uid="+generateRandom();
      }
    },

    load : function(token,id){

      // 加载登录信息
      var uinfo = this.userInfo
      var loadString = "/m/userInfo?token="+token;
      axios.get(loadString).then(function(response){
        if (response.data!="error") {
          uinfo.splice(0,1,response.data);
        }
      }).catch(function(error){
        console.log(“登录获取信息失败”);
      });


      var hg = this.resArr
      // TODO: token 验证
      var loadString = "/m/info?id="+id;

      var numberArr = this.numberArr;
      var elementArr = this.elementArr;
      var isShowPicT = this.isShowPic;

      var picExsit = this.isFileExsit

      var hu = this.highchartUrl
      var hu1 = this.highchartUrl1
      var hu2 = this.highchartUrl2
      var hu3 = this.highchartUrl3
      var hu4 = this.highchartUrl4

      var jshtml = this.jsmolHtml

      axios.get(loadString).then(function(response){
        hg.splice(0,1,response.data);
        var name = response.data.basic.pymatgen_poscar.comment;
        numberArr.splice(0,1,analyString(name)[0]);
        elementArr.splice(0,1,analyString(name)[1]);
        if (response.data.isshow==1) {
          isShowPicT.splice(0,1,true);
        }
        if (hg[0].extract.extract_info.band_gap<0.1||!hg[0].isShowTransport) {
          isShowPicT[0] = false;
        }
        // picExsit();
        // 初始化iframe url
        jshtml[0] = "jsmol.html";
        setTimeout("",1000);
        hu[0]="http://202.120.121.199:8083/MIP/page/highCharts.html?extract_id="+GetRequest()["id"]+"&uid="+generateRandom();
        if (isShowPicT[0]==true) {
          hu1[0]="http://202.120.121.199:8083/MIP/page/TPPTypeChart.html?extract_id="+GetRequest()["id"]+"&uid="+generateRandom();
          hu2[0]="http://202.120.121.199:8083/MIP/page/TPNTypeChart.html?extract_id="+GetRequest()["id"]+"&uid="+generateRandom();
          hu3[0]="http://202.120.121.199:8083/MIP/page/PFPTypeChart.html?extract_id="+GetRequest()["id"]+"&uid="+generateRandom();
          hu4[0]="http://202.120.121.199:8083/MIP/page/PFNTypeChart.html?extract_id="+GetRequest()["id"]+"&uid="+generateRandom();
        }
      }).catch(function(error){
        console.log(error);
      });

    },

    download : function(){
      var d1 = this.downloadList.indexOf("d1")>=0?1:0;
      var d2 = this.downloadList.indexOf("d2")>=0?1:0;
      var d3 = this.downloadList.indexOf("d3")>=0?1:0;
      var url = "/static/xyl/"+this.resArr[0].extract.extract_info.system_type+"/"+this.resArr[0].extract.m_id+"/Static/test_scan/";
      if (d1===1) {
        window.open(url+"INCAR")
      }
      if (d2===1) {
        window.open(url+"POSCAR")
      }
      if (d3===1) {
        window.open(url+"KPOINTS")
      }
    },


    downloadFromMongo : function(){
      var d1 = this.downloadList.indexOf("d1")>=0?1:0;
      var d2 = this.downloadList.indexOf("d2")>=0?1:0;
      var d3 = this.downloadList.indexOf("d3")>=0?1:0;
      if (d1===1) {
        window.open("/m/filedownload?mid="+this.resArr[0].extract._id.$oid+"&filename="+"incar")
      }
      if (d2===1) {
        window.open("/m/filedownload?mid="+this.resArr[0].extract._id.$oid+"&filename="+"poscar")
      }
      if (d3===1) {
        window.open("/m/filedownload?mid="+this.resArr[0].extract._id.$oid+"&filename="+"kpoints")

      }
    },

    sourceDownload : function(){
      window.open("/MIP/download_bandstructure.do?extract_id="+this.resArr[0].extract._id.$oid)
    },

    figure : function(number){
      return "/m/imgload?jobid="+this.resArr[0].jobid+"&type="+number;
    },

    isFileExsit : function(){
      var picUrl_1 = "/static/xyl/"+this.resArr[0].jobid+"_"+this.resArr[0].basic.original_id+"/BSimg.png";
      console.log(picUrl_1);
      var picExsitFlag = this.picExsitFlag;
      $.ajax({
         url:picUrl_1,
         type:'HEAD',
         error: function() {
             picExsitFlag.splice(0,1,false);
             return false;
         },
         success: function() {
             picExsitFlag.splice(0,1,true);
             return true;

         }
      });
    }
  }

});
