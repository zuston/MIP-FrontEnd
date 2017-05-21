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
  },
  watch : {

  },
  created : function(){
    this.load(GetRequest()["token"],GetRequest()["id"]);
  },
  ready : function(){
  },
  methods : {
    load : function(token,id){
      var hg = this.resArr
      // TODO: token 验证
      var loadString = "/m/info?id="+id;

      var numberArr = this.numberArr;
      var elementArr = this.elementArr;

      var picExsit = this.isFileExsit
      axios.get(loadString).then(function(response){
        hg.splice(0,1,response.data);
        var name = response.data.basic.pymatgen_poscar.comment;
        numberArr.splice(0,1,analyString(name)[0]);
        elementArr.splice(0,1,analyString(name)[1]);
        console.log(numberArr[0]);
        console.log(elementArr[0]);
        console.log(response.data);
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
