
function searchElementJson(vp){
  for (var i = 0; i < elementJson.length; i++) {
    if (elementJson[i].symbol==vp) {
      return elementJson[i];
    }
  }
  return 0;
}



function openWindowWithPost(url,values)
{
    var newWindow = window.open(url);
    if (!newWindow)
        return false;

    var html = "";
    html += "<html><head></head><body><form id='formid' method='post' action='" + url + "'>";


    for (var i = 0; i < values.length; i++) {
      html += "<input type='hidden' name='mids' value='" + values[i] + "'/>";
    }

    html += "</form><script type='text/javascript'>document.getElementById('formid').submit();";
    html += "<\/script></body></html>".toString().replace(/^.+?\*|\\(?=\/)|\*.+?$/gi, "");
    newWindow.document.write(html);
    return newWindow;
}


// 获取url的参数
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

var vm = new Vue({
  el : "#app",
  data : {

    resList : new Array(),
    searchPage : 1,
    buttonPage : new Array(),
    currentPage : [1],
    endPage : [1],
    len : 0,

    // 总计搜索条目数
    totalCount : [0],
    hover : 'X',
    hoverList : [],

    selectedElement : "selectedElement",
    element : "element",
    avaliable : "avaliable",

    hoverShowArray : new Array('Z','X','Mass','element','Electronegativity(EN)','configuration'),

    loadingIf : [false],

    bandgap : null,
    spacegroup : null,
    es : null,
    ve : null,

    // 搜索的表达式
    expression : null,
    expressStr : null,
    // 购物车点选列表
    cartList : [],
    cartListFormual : [],
    partChooseArr : [],

    // 错误信息
    searchError : [-1],

    // 比例信息查询
    bili : "",
    biliNumber : "",

    // 当前是哪种查询的标识字段
    currentSearchTag : 0,

    //计算数据类型
    dataType : 0,

    //化学式角标生成
    //最简化学式的角标
    numberArr : [],
    elementArr : [],
    //原始化学式的角标
    complexNumberArr : [],
    complexElementArr : [],

    conditionFlag : [true,true,true],

    userInfo : [-1],

    dataBaseCount : [],
  },
  created : function(){
    this.load(GetRequest()["token"]);
  },
  watch : {
    resList : function () {
        len = this.resList.length
    },

    hoverList : function(){

    },

    es : function(){
      if (this.es===null) {
        return;
      }
      if (this.expressStr!=null&&this.es.length==0) {
        this.expressStr = this.expressStr.replace(/\(es=(.*?)\)/,"");
        if (this.expressStr.charAt(this.expressStr.length-1)=="&") {
          this.expressStr = this.expressStr.substr(0,this.expressStr.length-1);
        }else if (this.expressStr.charAt(0)=="&") {
          this.expressStr = this.expressStr.substr(1,this.expressStr.length);
        }
        return;
      }
      if (this.expressStr!=null&&this.expressStr.indexOf("es")>0) {
        this.expressStr = this.expressStr.replace(/\(es=(.*?)\)/,"(es="+this.es+")");
      }else{

        if (this.expressStr==null||this.expressStr=="") {
          this.expressStr = "";
          this.expressStr += "(es="+this.es+")"
        }else{
          this.expressStr += "&(es="+this.es+")"
        }

      }
    },

    ve : function(){
      if (this.ve===null) {
        return
      }
      if (this.expressStr!=null&&this.ve.length==0) {
        this.expressStr = this.expressStr.replace(/\(ve=(.*?)\)/,"");
        if (this.expressStr.charAt(this.expressStr.length-1)=="&") {
          this.expressStr = this.expressStr.substr(0,this.expressStr.length-1);
        }else if (this.expressStr.charAt(0)=="&") {
          this.expressStr = this.expressStr.substr(1,this.expressStr.length);
        }
        return;
      }
      if (this.expressStr!=null&&this.expressStr.indexOf("ve")>0) {
        this.expressStr = this.expressStr.replace(/\(ve=(.*?)\)/,"(ve="+this.ve+")");
      }else{

        if (this.expressStr==null||this.expressStr=="") {
          this.expressStr = "";
          this.expressStr += "(ve="+this.ve+")"
        }else{
          this.expressStr += "&(ve="+this.ve+")"
        }

      }
    },

    // 监听spacegroup变化
    spacegroup : function(){
      if (this.spacegroup===null) {
        return;
      }
      if (this.expressStr!=null&&this.spacegroup.length==0) {
        this.expressStr = this.expressStr.replace(/\(sg=(.*?)\)/,"");
        if (this.expressStr.charAt(this.expressStr.length-1)=="&") {
          this.expressStr = this.expressStr.substr(0,this.expressStr.length-1);
        }else if (this.expressStr.charAt(0)=="&") {
          this.expressStr = this.expressStr.substr(1,this.expressStr.length);
        }
        return;
      }
      if (this.expressStr!=null&&this.expressStr.indexOf("sg")>0) {
        this.expressStr = this.expressStr.replace(/\(sg=(\d*?)\)/,"(sg="+this.spacegroup+")");
      }else{
        if (this.expressStr==null||this.expressStr=="") {
          this.expressStr = "";
          this.expressStr += "(sg="+this.spacegroup+")"
        }else {
          this.expressStr += "&(sg="+this.spacegroup+")"
        }
      }
    }

  },
  methods : {
    load : function(id){
      var loadString = "/m/userInfo?token="+id;
      var uinfo = this.userInfo;
      axios.get(loadString).then(function(response){
        if (response.data!="nullzero") {
          uinfo.splice(0,1,response.data);
        }
      }).catch(function(error){

      });
    },

    addCondition : function(event){
      this.Condition.componentChildren.push(new ConditionObject(0,0,0,[""]))
    },

    hoverListen : function(val){
        this.hoverShowArray.splice(0,this.hoverShowArray.length)
        element = searchElementJson(val)
        if (element!==0) {
            this.hoverShowArray.push(element.z)
            this.hoverShowArray.push(element.symbol)
            this.hoverShowArray.push(element.mass.toFixed(5))
            this.hoverShowArray.push(element.name.toLowerCase())
            this.hoverShowArray.push("EN:"+element.electronegativity.toFixed(3))
            this.hoverShowArray.push(egJson[0][element.symbol])
        }
    },
    hoverOut : function(){
        // this.hoverShowArray.splice(0,this.hoverShowArray.length)
      this.hoverShowArray = new Array('Z','X','Mass','element','[EN]',' electron configuration')
    },
    savehover : function(val){
      if(this.hoverList.indexOf(val)<=-1){
        this.hoverList.push(val);
      }else{
        this.hoverList.splice(this.hoverList.indexOf(val),1);
      }
      this.expression = this.hoverList
      this.expressStr = "";
      for (var i = 0; i < this.expression.length; i++) {
        // console.log(this.expression[i]);
        this.expressStr += this.expression[i]+"&";
      }
      this.expressStr = this.expressStr.substring(0,this.expressStr.length-1);

      if(this.spacegroup!=null){
        if(this.expressStr.length>0){
          this.expressStr += "&(sg="+this.spacegroup+")";
        }else{
          this.expressStr += "(sg="+this.spacegroup+")";
        }
      }

      if(this.es!=null){
        if(this.es.length>0){
          this.expressStr += "&(es="+this.es+")";
        }else{
          this.expressStr += "(es="+this.es+")";
        }
      }
      if(this.ve!=null){
        if(this.ve.length>0){
          this.expressStr += "&(ve="+this.ve+")";
        }else{
          this.expressStr += "(ve="+this.ve+")";
        }
      }

    },

    // remove : function(index){
    //   if(this.Condition.componentChildren.length>1){
    //     this.Condition.componentChildren.splice(index,1)
    //   }
    // },

    getInfoPage : function(oid){
      return "info.html?token="+GetRequest()["token"]+"&id="+oid;
    },

    download : function(){
      window.open('/m/download?expression='+encodeURIComponent(this.expressStr)+'&computed='+this.dataType);
    },

    poscarDownload : function(){
      window.open('/m/poscarDownload?expression='+encodeURIComponent(this.expressStr)+'&computed='+this.dataType);
    },

    search : function(page,first,searchTag=0){
      console.log(this.searchTag);
      if (first) {
        this.cartList = []
        this.cartListFormual = []
      }

      count = this.totalCount


      var Request=new Object();
      Request=GetRequest();
      var token = Request["token"]

      if (token==undefined) {
        this.searchError[0] = "token未携带,无法查询"
        return
      }

      this.searchError = [-1]

      this.resList.splice(0,this.resList.length);
      this.numberArr = []
      this.elementArr = []
      this.complexNumberArr = []
      this.complexElementArr = []

      var ajaxString = "";
      if (searchTag==0) {
        // 校验
        if(this.expressStr===null||this.expressStr.length==0){
          alert("请输入");
          return
        }
        var searchContent = this.expressStr;
        searchContent = searchContent.replace(/\|/g,"#");
        console.log(searchContent);
        var changeSearchContent = encodeURIComponent(searchContent);
        ajaxString = '/m/s?expression='+changeSearchContent+"&page="+page+"&token="+token+"&computed="+this.dataType;
      }else if (searchTag==1) {
        if(this.bili===""){
          alert("请输入比例");
          return;
        }
        ajaxString = '/m/p?bili='+encodeURIComponent(this.bili)+'&biliNumber='+encodeURIComponent(this.biliNumber)+"&page="+page+"&computed="+this.dataType;
      }

      this.currentSearchTag = searchTag;

      this.loadingIf[0] = true;
      var loadingIf = this.loadingIf;
      var res = this.resList
      var buttonPage = this.buttonPage
      var currentPage = this.currentPage
      var endPage = this.endPage

      var error = this.searchError

      var numberArr = this.numberArr
      var elementArr = this.elementArr

      var complexNumberArr = this.complexNumberArr
      var complexElementArr = this.complexElementArr

      var dbCount = this.dataBaseCount


      axios.get(ajaxString)
      .then(function (response) {
        console.log("searching.......");
        if(res.length!==0){
          res.splice(0,res.length)
        }

        if (response.data.error!=undefined) {
            error[0] = response.data['msg']
            loadingIf.splice(0,1,false);
            // loadingIf[0] = false
            return
        }
        console.log(response);
        if ("c" in response.data) {
          for(var value of response.data.c){
            res.push(value)
            numberArr.push(analyStringNew(value.simplified_name)[0]);
            elementArr.push(analyStringNew(value.simplified_name)[1]);
            complexNumberArr.push(analyStringNew(value.compound_name)[0]);
            complexElementArr.push(analyStringNew(value.compound_name)[1]);
          }

          buttonPage.splice(0,buttonPage.length)

          currentPage[0] = response.data.cpage
          dbCount.splice(0,1,response.data.allCount)
          totalCount = response.data.count
          totalPage = Math.ceil(response.data.count/30)
          if (currentPage[0]-2<=1) {
            for (var i = currentPage-1; i>0; i--) {
              console.log("the firewall is too big");
              buttonPage.splice(0,0,i)
            }
          }else{
            buttonPage.push(1)
            buttonPage.push(currentPage[0]-2)
            buttonPage.push(currentPage[0]-1)

          }
          buttonPage.push(currentPage[0])

          frontIndex = buttonPage.length

          if (currentPage[0]+2>=totalPage) {
            for (var i = currentPage[0]+1; i <= totalPage; i++) {
              console.log("the firewall is too fat");
              buttonPage.splice(frontIndex++,0,i)
            }
          }else{
            // buttonPage.push(currentPage)
            buttonPage.push(currentPage[0]+1)
            buttonPage.push(currentPage[0]+2)
            buttonPage.push(totalPage)
          }
          endPage.splice(0,1,totalPage);
          loadingIf.splice(0,1,false);
          count.splice(0,1,totalCount);
        }
      })
      .catch(function (error) {
        console.log(error);
        loadingIf.splice(0,1,false);
      });
    },

    cart : function(index,formual){
      if(this.cartList.indexOf(index)>-1){
        var position = this.cartList.indexOf(index);
        var pos = this.cartListFormual.indexOf(formual);
        this.cartList.splice(position,1);
        this.cartListFormual.splice(pos,1);
      }else{
        this.cartList.push(index);
        this.cartListFormual.push(formual);
      }
    },

    // 移除购物车选项
    removeCart : function(formual){
      var position = this.cartListFormual.indexOf(formual);
      this.cartListFormual.splice(position,1);
      this.cartList.splice(position,1);
    },

    chooseAll : function(resList){
      var count = 0;
      for (var i = 0; i < resList.length; i++) {
        if(this.cartList.indexOf(resList[i].original_id)<0){
          this.cartList.push(resList[i].original_id);
          this.cartListFormual.push(resList[i].compound_name);
        }else{
          count ++;
        }
      }
      if (count==resList.length) {
        for (var i = 0; i < resList.length; i++) {
          this.cartList.splice(this.cartList.indexOf(resList[i].original_id),1);
          this.cartListFormual.splice(this.cartListFormual.indexOf(resList[i].compound_name),1);
        }
      }
    },

    cancelCalculate : function(){
      this.cartList.splice(0,this.cartList.length);
      this.cartListFormual.splice(0,this.cartListFormual.length);
    },

    // 传递计算
    caculate : function(){
      var idString = "";
      for (var i = 0; i < this.cartList.length; i++) {
        idString+="mids="+this.cartList[i]+"&";
      }
      idString = idString.substring(0,idString.length-1);
      // idString = encodeURIComponent(idString);
      // alert(idString);
      // window.open("http://nova.shu.edu.cn/SpringMVC/searchFromWeb.do?"+idString);
      openWindowWithPost("http://nova.shu.edu.cn/SpringMVC/searchFromWeb.do",this.cartList)
    },

    isAll : function(resList){
      var count = 0;
      for (var i = 0; i < resList.length; i++) {
        if(this.cartList.indexOf(resList[i].original_id)>=0){
          count ++;
        }
      }

      if(count==resList.length){
        return true;
      }
      return false;
    },

    addCondition : function(tag){
      console.log(tag);
      console.log(this.conditionFlag[tag]);
      this.conditionFlag.splice(tag,1,false);
      console.log(this.conditionFlag[tag]);

    },

    removeCondition : function(tag){
      this.conditionFlag.splice(tag,1,true);
    },

    // 族系选定
    partChoose : function(tag){
      if (tag=='1A') {
        this.partChooseArr = [];
        this.partChooseArr.push('H');
        this.partChooseArr.push('Li');
        this.partChooseArr.push('Na');
        this.partChooseArr.push('K');
        this.partChooseArr.push('Rb');
        this.partChooseArr.push('Cs');
        this.partChooseArr.push('Fr');
      }

      if (tag=='2A') {
        this.partChooseArr = [];
        this.partChooseArr.push('Be');
        this.partChooseArr.push('Mg');
        this.partChooseArr.push('Ca');
        this.partChooseArr.push('Sr');
        this.partChooseArr.push('Ba');
        this.partChooseArr.push('Ra');
      }

      if (tag=='3B') {
        this.partChooseArr = [];
        this.partChooseArr.push('Sc');
        this.partChooseArr.push('Y');
        // this.partChooseArr.push('Na');
        // this.partChooseArr.push('K');
        // this.partChooseArr.push('Rb');
        // this.partChooseArr.push('Cs');
        // this.partChooseArr.push('Fr');
      }

      if (tag=='4B') {
        this.partChooseArr = [];
        this.partChooseArr.push('Ti');
        this.partChooseArr.push('Zr');
        this.partChooseArr.push('Hf');
        this.partChooseArr.push('Rf');
      }

      if (tag=='5B') {
        this.partChooseArr = [];
        this.partChooseArr.push('V');
        this.partChooseArr.push('Nb');
        this.partChooseArr.push('Ta');
        this.partChooseArr.push('Db');
      }

      if (tag=='6B') {
        this.partChooseArr = [];
        this.partChooseArr.push('Cr');
        this.partChooseArr.push('Mo');
        this.partChooseArr.push('W');
        this.partChooseArr.push('Sg');
      }

      if (tag=='7B') {
        this.partChooseArr = [];
        this.partChooseArr.push('Mn');
        this.partChooseArr.push('Tc');
        this.partChooseArr.push('Re');
        this.partChooseArr.push('Bh');
      }

      if (tag=='8B1') {
        this.partChooseArr = [];
        this.partChooseArr.push('Fe');
        this.partChooseArr.push('Ru');
        this.partChooseArr.push('Os');
        this.partChooseArr.push('Hs');
      }

      if (tag=='8B2') {
        this.partChooseArr.push('Co');
        this.partChooseArr.push('Rh');
        this.partChooseArr.push('Ir');
        this.partChooseArr.push('Mt');
      }

      if (tag=='8B3') {
        this.partChooseArr.push('Ni');
        this.partChooseArr.push('Pd');
        this.partChooseArr.push('Pt');
      }


      if (tag=='1B') {
        this.partChooseArr = [];
        this.partChooseArr.push('Cu');
        this.partChooseArr.push('Ag');
        this.partChooseArr.push('Au');
      }

      if (tag=='2B') {
        this.partChooseArr = [];
        this.partChooseArr.push('Zn');
        this.partChooseArr.push('Cd');
        this.partChooseArr.push('Hg');
      }

      if (tag=='3A') {
        this.partChooseArr = [];
        this.partChooseArr.push('B');
        this.partChooseArr.push('Al');
        this.partChooseArr.push('Ga');
        this.partChooseArr.push('In');
        this.partChooseArr.push('Tl');
      }

      if (tag=='4A') {
        this.partChooseArr = [];
        this.partChooseArr.push('C');
        this.partChooseArr.push('Si');
        this.partChooseArr.push('Ge');
        this.partChooseArr.push('Sn');
        this.partChooseArr.push('Pb');
      }

      if (tag=='5A') {
        this.partChooseArr = [];
        this.partChooseArr.push('N');
        this.partChooseArr.push('P');
        this.partChooseArr.push('As');
        this.partChooseArr.push('Sb');
        this.partChooseArr.push('Bi');
      }

      if (tag=='6A') {
        this.partChooseArr = [];
        this.partChooseArr.push('O');
        this.partChooseArr.push('S');
        this.partChooseArr.push('Se');
        this.partChooseArr.push('Te');
        this.partChooseArr.push('Po');
      }

      if (tag=='7A') {
        this.partChooseArr = [];
        this.partChooseArr.push('F');
        this.partChooseArr.push('Cl');
        this.partChooseArr.push('Br');
        this.partChooseArr.push('I');
        this.partChooseArr.push('At');
      }
    },

    // 族系移除时候清空
    departChoose : function(){
      this.partChooseArr = [];
    },

    // 族系click时候选定
    choose : function(tag){
      this.savehover(tag);
    },

    clearSearch : function(){
      this.expressStr = null;
      this.expression = null;
      this.ve = null;
      this.es = null;
      this.spacegroup = null;
      this.hoverList.splice(0,this.hoverList.length);
    },



    chooseAllResult : function(){
      var searchContent = this.expressStr;
      searchContent = searchContent.replace(/\|/g,"#");
      var changeSearchContent = encodeURIComponent(searchContent);
      ajaxString = '/m/calculate?expression='+changeSearchContent+"&computed="+this.dataType;

      axios.get(ajaxString).then(function(response){
        var calculateString = ""
        console.log(response.data);
        var ddata = response.data.c

        var dlist = []
        for(var value of ddata){
          var mid = value.original_id
          calculateString += "mids="+mid+"&"
          dlist.push(mid)
        }
        // 计算传递参数值
        calculateString = calculateString.substring(0,calculateString.length-1)
        // window.open("http://nova.shu.edu.cn/SpringMVC/searchFromWeb.do?"+calculateString);
        console.log(dlist);
        console.log("change the file");
        openWindowWithPost("http://nova.shu.edu.cn/SpringMVC/searchFromWeb.do",dlist)
        console.log("end");
      }).catch(function(error){
        console.log(error);
      });

    },


    chooseRandomResult : function(randomValue){
      var searchContent = this.expressStr;
      searchContent = searchContent.replace(/\|/g,"#");
      var changeSearchContent = encodeURIComponent(searchContent);
      ajaxString = '/m/randomcalculate?expression='+changeSearchContent+"&computed="+this.dataType;

      axios.get(ajaxString).then(function(response){
        var calculateString = ""
        console.log(response.data);
        var ddata = response.data.c

        var dlist = []
        for(var value of ddata){
          var mid = value.original_id
          calculateString += "mids="+mid+"&"
          dlist.push(mid)
        }
        // 计算传递参数值
        calculateString = calculateString.substring(0,calculateString.length-1)
        // window.open("http://nova.shu.edu.cn/SpringMVC/searchFromWeb.do?"+calculateString);
        openWindowWithPost("http://nova.shu.edu.cn/SpringMVC/searchFromWeb.do",dlist)
        console.log("end");
      }).catch(function(error){
        console.log(error);
      });

    }
  }
})
