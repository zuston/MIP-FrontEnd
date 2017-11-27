
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

// 是否只存在一个 key 值
// 忽略最后一个的 connection 值
function isExistOneKey(paramsList){
  if(paramsList.length==1)  return true
  var map = new HashMap()
  for (var i = 0; i < paramsList.length-1; i++) {
    var obj = paramsList[i]
    map.put(obj.connection,"")
  }
  if (map.size()==1) return true;
  return false;
}
// 选择的条件最后生成表达式，这个函数为关键函数
function simpleGenerator(paramsList,suffix){
  var spaceGroupFormualList = []
  if (paramsList.length!=0) {
    var spaceGroupFormual = ""
    // 校验连接条件，只支持全部 And 或 全部 Or
    var tag = isExistOneKey(paramsList)
    var compareIndex = paramsList[0].connection
    // 验证全是 all 或者 全是 or
    if (tag===true) {
      // 一个条件或者多个组合 and
      if (paramsList.length==1) {
        var obj = paramsList[0]
        spaceGroupFormual = "("+suffix+obj.action+obj.value+")"
        return spaceGroupFormual
      }
      // 如果全是 and
      else if (compareIndex=='and') {
        // 多个 and 后序条件会冲掉前面的条件
        var hm = new HashMap()
        for (var i = 0; i < paramsList.length; i++) {
          var obj = paramsList[i]
          if (obj.action=="=") {
            return false
          }
          hm.put(obj.action,obj)
        }
        // todo 判断是否存在两个
        if (hm.size()==2) {
          var leftOne = hm.get(">")
          var rightOne = hm.get("<")
          spaceGroupFormual = "("+suffix+"="+leftOne.value+"-"+rightOne.value+")"
          return spaceGroupFormual
        }else{
          if (hm.containsKey(">")) {
            spaceGroupFormual = "("+suffix+hm.get(">").action+hm.get(">").value+")"
          }else{
            spaceGroupFormual = "("+suffix+hm.get("<").action+hm.get("<").value+")"
          }
          return spaceGroupFormual
        }

      }else{
        // 此处 else 是全部是 or 的情况
        // 全部是 = 一种情况
        // 或者是包含其他符号
        var hm = new HashMap()
        for (var i = 0; i < paramsList.length; i++) {
          var obj = paramsList[i]
          hm.put(obj.action,obj)
        }
        if (hm.size()==1 && hm.containsKey("=")) {
          var valueList = []
          for (var i = 0; i < paramsList.length; i++) {
            var obj = paramsList[i]
            valueList.push(obj.value)
          }
          spaceGroupFormual = "("+suffix+"="+valueList.join("|")+")"
          return spaceGroupFormual
        }else{
          // 复杂符号的 or 组合
          // return 0
          // 暂时直接第一个为主
          var obj = paramsList[0]
          spaceGroupFormual = "("+suffix+obj.action+obj.value+")"
          return spaceGroupFormual
        }
      }
    }else {
      // 出现多个 and or 是非法
      return false
    }
  }
}
// 组合算法
function simpleComponentArgs(needComponentList,keyList){
  var step = needComponentList.length
  var resList = []
  loop(0,resList,step+1,"",needComponentList,keyList)
  return resList
}
function loop(step,resList,end,tempString,needComponentList,keyList){
  if (step==end) {
    resList.push(tempString)
    return
  }
  var obj = needComponentList[step]
  var tag = keyList[step]
  for (var i = 0; i < 2; i++) {
    var tempO = obj[i]
    if (tempString.length!=0) {
      tempString += "&"+tag+tempO.action+tempO.value
    }else {
      tempString = tag+tempO.action+tempO.value
    }
    loop(step+1,resList,end,tempString,needComponentList,keyList)
  }
}

function listener(spaceGroup){
  if (spaceGroup.length<=0) {
    return
  }

  var firstAction = spaceGroup[0].action
  if (firstAction=="=") {
    spaceGroup[0].connection = "or"
  }else{
    spaceGroup[0].connection = "and"
  }
  var firstAction = spaceGroup[0].action
  for (var i = 1; i < spaceGroup.length; i++) {
    if (firstAction=="=") {
      spaceGroup[i].connection = "or"
      spaceGroup[i].action = "="
    }else{
      if (spaceGroup[i].action == '=') {
        spaceGroup[i].action = ">"
      }
      spaceGroup[i].connection = "and"
    }
  }
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

    hoverShowArray : [],

    loadingIf : [false],

    bandgap : null,
    spacegroup : null,
    es : null,
    ve : null,
    en : null,

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
    dataType : 2,

    //化学式角标生成
    //最简化学式的角标
    numberArr : [],
    elementArr : [],
    //原始化学式的角标
    complexNumberArr : [],
    complexElementArr : [],

    conditionFlag : [true,true,true,true],

    userInfo : [-1],

    dataBaseCount : [],

    randomCalculateCount : null,

    // 点选搜索模块
    atomRadio : [],
    spaceGroup : [],
    valenceElectrons : [],
    elementTypeNumbers : [],
    // 临时测试变量
    sstring : '',
    // 元素是全选还是只含有
    formualType : 2,

    // Attention!!!!!!!!
    // 改版之后，expressStr 不再代表条件组合的 formual 了
    // 以 generateFormual 来代表生成的 formual
    generateFormual : '',

    // 搜索模式的切换的 tag,true 为简单模式，false 为自己输入复杂表达式模式
    simpleSearchTag : true,

    // 新增复杂表达式查询，变量
    complexSearchFormual : "",

     endFlag:false //赋值完成标识
  },
  created : function(){
    this.load(GetRequest()["token"]);
  },
  watch : {

    spaceGroup : {
      handler : function(val, oldval){
        listener(this.spaceGroup)
      },
      deep : true
    },
    valenceElectrons : {
      handler : function(val, oldval){
        listener(this.valenceElectrons)
      },
      deep : true
    },
    elementTypeNumbers : {
      handler : function(val, oldval){
        listener(this.elementTypeNumbers)
      },
      deep : true
    },

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

    en : function(){
      if (this.en===null) {
        return
      }
      if (this.expressStr!=null&&this.en.length==0) {
        this.expressStr = this.expressStr.replace(/\(en=(.*?)\)/,"");
        if (this.expressStr.charAt(this.expressStr.length-1)=="&") {
          this.expressStr = this.expressStr.substr(0,this.expressStr.length-1);
        }else if (this.expressStr.charAt(0)=="&") {
          this.expressStr = this.expressStr.substr(1,this.expressStr.length);
        }
        return;
      }
      if (this.expressStr!=null&&this.expressStr.indexOf("en")>0) {
        this.expressStr = this.expressStr.replace(/\(en=(.*?)\)/,"(en="+this.en+")");
      }else{

        if (this.expressStr==null||this.expressStr=="") {
          this.expressStr = "";
          this.expressStr += "(en="+this.en+")"
        }else{
          this.expressStr += "&(en="+this.en+")"
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
      this.hoverShowArray = new Array('Z','X','Mass','element','Electronegativity(EN)','configuration')
      this.endFlag = true
      var loadString = "/m/userInfo?token="+id;
      var uinfo = this.userInfo;
      axios.get(loadString).then(function(response){
        if (response.data!="error") {
          uinfo.splice(0,1,response.data);
        }
      }).catch(function(error){

      });
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

    selectedDownload : function(){
      this.download();
      this.poscarDownload();
    },

    download : function(){
      // 获取选中的下载
      var idString = "";
      for (var i = 0; i < this.cartList.length; i++) {
        idString+=this.cartList[i]+"&";
      }
      idString = idString.substring(0,idString.length-1);
      window.open('/m/choosedExcelDownload?mids='+encodeURIComponent(idString)+'&computed='+this.dataType);
      // window.open('/m/download?expression='+encodeURIComponent(this.expressStr)+'&computed='+this.dataType);
    },

    poscarDownload : function(){
      // 获取选中的下载
      var idString = "";
      for (var i = 0; i < this.cartList.length; i++) {
        idString+=this.cartList[i]+"&";
      }
      idString = idString.substring(0,idString.length-1);
      window.open('/m/choosedPoscarDownload?mids='+encodeURIComponent(idString)+'&computed='+this.dataType);

      // window.open('/m/poscarDownload?expression='+encodeURIComponent(this.expressStr)+'&computed='+this.dataType);
    },

    allDownload : function(){
      window.open('/m/download?expression='+encodeURIComponent(this.generateFormual)+'&computed='+this.dataType);
      window.open('/m/poscarDownload?expression='+encodeURIComponent(this.generateFormual)+'&computed='+this.dataType);
    },

    search : function(page,first,searchTag){
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

        // 改版之后需要生成的表达式
        var searchContent = this.generateFormual;
        // 校验
        if(searchContent===null||searchContent.length==0){
          alert("请输入");
          return
        }
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
        if (typeof response.data.c!="undefined") {
          var len = response.data.c.length
          for(var i=0;i<len;i++){
            var value = response.data.c[i]
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
      openWindowWithPost("http://202.120.121.199:8083/MIP/searchFromWeb.do",this.cartList)
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
      this.conditionFlag.splice(tag,1,false);
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
      var searchContent = this.generateFormual;
      searchContent = searchContent.replace(/\|/g,"#");
      var changeSearchContent = encodeURIComponent(searchContent);
      ajaxString = '/m/calculate?expression='+changeSearchContent+"&computed="+this.dataType;

      axios.get(ajaxString).then(function(response){
        var calculateString = ""
        console.log(response.data);
        var ddata = response.data.c

        var dlist = []
        for(var value in ddata){
          var mid = value.original_id
          calculateString += "mids="+mid+"&"
          dlist.push(mid)
        }
        // 计算传递参数值
        calculateString = calculateString.substring(0,calculateString.length-1)
        // window.open("http://nova.shu.edu.cn/SpringMVC/searchFromWeb.do?"+calculateString);
        console.log(dlist);
        console.log("change the file");
        openWindowWithPost("http://202.120.121.199:8083/MIP/searchFromWeb.do",dlist)
        console.log("end");
      }).catch(function(error){
        console.log(error);
      });

    },


    chooseRandomResult : function(randomValue){
      console.log(randomValue);
      var searchContent = this.generateFormual;
      searchContent = searchContent.replace(/\|/g,"#");
      var changeSearchContent = encodeURIComponent(searchContent);
      ajaxString = '/m/randomcalculate?expression='+changeSearchContent+"&computed="+this.dataType;

      axios.get(ajaxString).then(function(response){
        var calculateString = ""
        console.log(response.data);
        var ddata = response.data.c

        var dlist = []
        for(var value in ddata){
          var mid = value.original_id
          calculateString += "mids="+mid+"&"
          dlist.push(mid)
        }
        // 计算传递参数值
        calculateString = calculateString.substring(0,calculateString.length-1)
        // window.open("http://nova.shu.edu.cn/SpringMVC/searchFromWeb.do?"+calculateString);
        openWindowWithPost("http://202.120.121.199:8083/MIP/searchFromWeb.do",dlist)
        console.log("end");
      }).catch(function(error){
        console.log(error);
      });

    },

    // 点选检索的增加单个条件中的复合部分
    addSearchCondition : function(index){
      // spaceGroup
      if (index===0) {
        var obj = new Object()
        if (this.spaceGroup.length==0) {
          obj.action = "="
          obj.value = 216
          obj.connection = "or"
          this.spaceGroup.push(obj)
          return
        }
        var startAction = this.spaceGroup[0].action
        if (startAction=="=") {
          obj.action = "="
          obj.value = 216
          obj.connection = "or"
        }else{
          obj.action = ">"
          obj.value = 216
          obj.connection = "and"
        }
        this.spaceGroup.push(obj)
        return
      }

      // atom radio
      if (index===1) {
         var obj = new Object()
         obj.action = "="
         obj.value = "1:1:1"
         obj.connection = "or"
         this.atomRadio.push(obj)
      }

      // valenceElectrons
      if (index===2) {
        var obj = new Object()
        if (this.valenceElectrons.length==0) {
          obj.action = "="
          obj.value = 10
          obj.connection = "or"
          this.valenceElectrons.push(obj)
          return
        }
        var startAction = this.valenceElectrons[0].action
        if (startAction=="=") {
          obj.action = "="
          obj.value = 10
          obj.connection = "or"
        }else{
          obj.action = ">"
          obj.value = 10
          obj.connection = "and"
        }
        this.valenceElectrons.push(obj)
        return
      }

      // elementTypeNumbers
      if (index===3) {
        var obj = new Object()
        if (this.elementTypeNumbers.length==0) {
          obj.action = "="
          obj.value = 10
          obj.connection = "and"
          this.elementTypeNumbers.push(obj)
          return
        }
        var startAction = this.elementTypeNumbers[0].action
        if (startAction=="=") {
          obj.action = "="
          obj.value = 10
          obj.connection = "or"
        }else{
          obj.action = ">"
          obj.value = 10
          obj.connection = "and"
        }
        this.elementTypeNumbers.push(obj)
        return
      }

    },

    removeSearchCondition : function(tag,indexValue){
      if (tag===0) {
        this.spaceGroup.splice(indexValue,1)
      }
      if (tag===1) {
        this.atomRadio.splice(indexValue,1)
      }
      if (tag===2) {
        this.valenceElectrons.splice(indexValue,1)
      }
      if (tag===3) {
        this.elementTypeNumbers.splice(indexValue,1)
      }
    },

    generateFormualFunction : function(){
      var conditionFormual = ""
      // spaceGroup
      var spaceGroupFormualList = []
      if (this.spaceGroup.length!=0) {
        var res = simpleGenerator(this.spaceGroup,"sg")
        if (res===false) {
          this.sstring = "error"
          return
        }
        if (res===0) {
          spaceGroupFormualList = this.spaceGroup
        }else {
          conditionFormual += res
        }
      }

      // atomRadio 表达式形式 es=1:1:1 or es=1:1:1|1:2:4
      if (this.atomRadio.length!=0) {
        var atomRadioFormual = ""
        if (this.atomRadio.length==1) {
          atomRadioFormual = "(es="+this.atomRadio[0].value+")"
        }else {
          var tempList = []
          for (var i = 0; i < this.atomRadio.length; i++) {
            var obj = this.atomRadio[i]
            tempList.push(obj.value)
          }
          atomRadioFormual += "(es="+tempList.join("|")+")"
        }
        if (conditionFormual.length!=0) {
          conditionFormual += "&"+atomRadioFormual
        }else{
          conditionFormual = atomRadioFormual
        }
      }

      var valenceElectronsFormualList = []
      if (this.valenceElectrons.length!=0) {
        var res = simpleGenerator(this.valenceElectrons,"ve")
        if (res===false) {
          this.sstring = "error"
          return
        }
        if (res===0) {
          valenceElectronsFormualList = this.valenceElectrons
        }else {
          if (conditionFormual.length!=0) {
            conditionFormual += "&"+res
          }else{
            conditionFormual = res
          }
        }
      }

      var elementTypeNumbersFormualList = []
      if (this.elementTypeNumbers.length!=0) {
        var res = simpleGenerator(this.elementTypeNumbers,"en")
        if (res===false) {
          this.sstring = "error"
          return
        }
        if (res===0) {
          elementTypeNumbersFormualList = this.elementTypeNumbers
        }else {
          if (conditionFormual.length!=0) {
            conditionFormual += "&"+res
          }else{
            conditionFormual = res
          }
        }
      }
      // 后端暂时不支持多 | 的表达式
      // var needComponentList = []
      // var keyList = []
      // if (spaceGroupFormualList.length>=1) {
      //   needComponentList.push(spaceGroupFormualList)
      //   keyList.push("sg")
      // }
      // if (valenceElectronsFormualList.length>=1) {
      //   needComponentList.push(valenceElectronsFormualList)
      //   keyList.push("ve")
      // }
      // if (elementTypeNumbersFormualList.length>=1) {
      //   needComponentList.push(elementTypeNumbersFormualList)
      //   keyList.push("en")
      // }
      // var componentFormualList = simpleComponentArgs(needComponentList,keyList)

      this.sstring = conditionFormual
    },

    // 简单搜索
    searchV2 : function(page,tag){
      this.generateFormualFunction()
      // 生成 element 句子
      var originalString = this.expressStr
      if (this.expressStr != null && this.expressStr!="") {
        // all ---> {S,Si,H}
        if (this.formualType==0) {
          var tempList = this.expressStr.split("&")
          var tempStr = tempList.join(",")
          this.expressStr = "{"+tempStr+"}"
        }
        // Exclusive
        if (this.formualType==1) {
          this.expressStr += "^"
        }
        // Include 不做操作
      }
      // 剔除 error 错误信息
      if (this.sstring.length>0&&this.sstring!="error") {
        if (this.expressStr != null) {
          this.expressStr += "&"+this.sstring
        }else{
          this.expressStr = this.sstring
        }
      }
      // alert(this.expressStr)
      this.generateFormual = this.expressStr
      this.search(page,tag,0)
      this.expressStr = originalString
    },

    clearV2 : function(){
      this.clearSearch()
      this.atomRadio = []
      this.spaceGroup = []
      this.valenceElectrons = []
      this.elementTypeNumbers = []
      // 收起condition框
      this.conditionFlag.splice(0,1,true)
      this.conditionFlag.splice(1,1,true)
      this.conditionFlag.splice(2,1,true)
      this.conditionFlag.splice(3,1,true)

    },

    removeConditionV2 : function(index){
      if (index==0) {
        this.spaceGroup = []
      }
      if (index==1) {
        this.atomRadio = []
      }
      if (index==2) {
        this.valenceElectrons = []
      }
      if (index==3) {
        this.elementTypeNumbers = []
      }
      this.removeCondition(index)
    },

    addConditionV2 : function(index){
      this.addSearchCondition(index)
      this.addCondition(index)
    },

    cancelSeletedElements : function(){
      this.clearSearch()
    },

    searchModeChange : function(value){
      if (value==0) {
        this.simpleSearchTag = true
      }
      if (value==1) {
        this.simpleSearchTag = false
      }
    },
    // 复杂表达式搜索调用
    searchV3 : function(page,first,formual){
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
      // 校验
      if(formual===null||formual.length==0){
        alert("请输入");
        return
      }
      // 复杂表达式查询语句与简单查询分开
      var searchContent = formual;
      searchContent = searchContent.replace(/\|/g,"#");
      console.log(searchContent);
      var changeSearchContent = encodeURIComponent(searchContent);
      ajaxString = '/m/s?expression='+changeSearchContent+"&page="+page+"&token="+token+"&computed="+this.dataType;


      this.currentSearchTag = 0;

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
        console.log("searchingv3.......");
        if(res.length!==0){
          res.splice(0,res.length)
        }

        if (response.data.error!=undefined) {
            error[0] = response.data['msg']
            loadingIf.splice(0,1,false);
            // loadingIf[0] = false
            return
        }
        if (response.data.c!=undefined) {
          for(var index in response.data.c){
            var value = response.data.c[index]
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

    clearSearchV3 : function(){
        this.complexSearchFormual = ""
    },

  }
})
