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
    picExsitFlag : [true],

    //实践看看角标的生成
    numberArr : [],
    elementArr : [],

    highchartUrl:"",
    highchartUrl1:"",
    highchartUrl2:"",
    highchartUrl3:"",
    highchartUrl4:"",
    highchartFlag:false,
    // 图片展示 tag
    isShowPic:[true],

    lock : true,
  },
  watch : {

  },
  created : function(){
    this.highchartFlag=true
    this.load(GetRequest()["token"],GetRequest()["id"]);
  },

  mounted : function(){
    this.initHighchartsUrl();
  },
  methods : {

    initHighchartsUrl:function(){
      setTimeout("",5000)
      this.highchartUrl="http://nova.shu.edu.cn:8083/MIP/page/highCharts.html?extract_id="+GetRequest()["id"];
      setTimeout("",5000)
      this.highchartUrl1="http://nova.shu.edu.cn:8083/MIP/page/TPPTypeChart.html?extract_id="+GetRequest()["id"];
      setTimeout("",5000)
      this.highchartUrl2="http://nova.shu.edu.cn:8083/MIP/page/TPNTypeChart.html?extract_id="+GetRequest()["id"];
      setTimeout("",5000)
      this.highchartUrl3="http://nova.shu.edu.cn:8083/MIP/page/PFPTypeChart.html?extract_id="+GetRequest()["id"];
      setTimeout("",5000)
      this.highchartUrl4="http://nova.shu.edu.cn:8083/MIP/page/PFNTypeChart.html?extract_id="+GetRequest()["id"];
    },

    load : function(token,id){
      var hg = this.resArr
      // TODO: token 验证
      var loadString = "/m/info?id="+id;

      var numberArr = this.numberArr;
      var elementArr = this.elementArr;
      var isShowPicT = this.isShowPic;

      var picExsit = this.isFileExsit
      axios.get(loadString).then(function(response){
        hg.splice(0,1,response.data);
        var name = response.data.basic.pymatgen_poscar.comment;
        numberArr.splice(0,1,analyString(name)[0]);
        elementArr.splice(0,1,analyString(name)[1]);
        // console.log(numberArr[0]);
        // console.log(elementArr[0]);
        // console.log(response.data);
        // console.log(response.data.isshow);
        if (response.data.isshow==1) {
          isShowPicT.splice(0,1,true);
        }
        if (hg[0].extract.extract_info.band_gap<0.1||!hg[0].isShowTransport) {
          isShowPicT[0] = false;
        }
        // picExsit();
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

    figure : function(number){
      // var filename = this.resArr[0].jobid+"_"+this.resArr[0].basic.original_id;
      // var imgNameMapper = ["","BSimg","DOSimg"];
      // console.log(filename);
      // return "/static/xyl/"+filename+"/"+imgNameMapper[number]+".png";
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
           console.log(11111111111111111);
             picExsitFlag.splice(0,1,false);
             return false;
         },
         success: function() {
             //file exists
             console.log(2222222222222222);
             picExsitFlag.splice(0,1,true);
             return true;

         }
      });
    }
  }

});
