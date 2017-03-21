
function searchElementJson(vp){
  for (var i = 0; i < elementJson.length; i++) {
    if (elementJson[i].symbol==vp) {
      return elementJson[i];
    }
  }
  return 0;
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

    hoverShowArray : new Array('Z','X','Mass','electronegativity','electronic configuration'),

    loadingIf : [false],

    bandgap : null,
    spacegroup : null,
    // 搜索的表达式
    expression : null,
    expressStr : null,
    // 购物车点选列表
    cartList : [],
  },
  created : function(){

  },
  watch : {
    resList : function () {
        len = this.resList.length
    },

    hoverList : function(){

    },

    // 监听bandgap变化
    bandgap : function(){
      if (this.expressStr!=null&&this.expressStr.indexOf("bandgap")>0) {
        this.expressStr = this.expressStr.replace(/\(bandgap=(\d*)\)/,"(bandgap="+this.bandgap+")");
      }else{

        if (this.expressStr==null) {
          this.expressStr = "";
          this.expressStr += "(bandgap="+this.bandgap+")"
        }else{
          this.expressStr += "&(bandgap="+this.bandgap+")"
        }

      }
    },

    // 监听spacegroup变化
    spacegroup : function(){
      if (this.expressStr!=null&&this.expressStr.indexOf("spacegroup")>0) {
        this.expressStr = this.expressStr.replace(/\(spacegroup=(\d*)\)/,"(spacegroup="+this.spacegroup+")");
      }else{
        if (this.expressStr==null) {
          this.expressStr = "";
          this.expressStr += "(spacegroup="+this.spacegroup+")"
        }else {
          this.expressStr += "&(spacegroup="+this.spacegroup+")"
        }
      }
    }

  },
  methods : {
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
            this.hoverShowArray.push("gatavity:"+element.electronegativity.toFixed(3))
            this.hoverShowArray.push(232323232)
        }
    },
    hoverOut : function(){
        // this.hoverShowArray.splice(0,this.hoverShowArray.length)
      this.hoverShowArray = new Array('Z','X','Mass','electronegativity','electronic configuration')
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
      if(this.bandgap!=null){
        if(this.expressStr.length>0){
          this.expressStr += "&(bandgap="+this.bandgap+")";
        }else{
          this.expressStr += "(bandgap="+this.bandgap+")";
        }
      }

      if(this.spacegroup!=null){
        if(this.expressStr.length>0){
          this.expressStr += "&(spacegroup="+this.bandspacegroupgap+")";
        }else{
          this.expressStr += "(spacegroup="+this.spacegroup+")";
        }
      }
    },

    remove : function(index){
      if(this.Condition.componentChildren.length>1){
        this.Condition.componentChildren.splice(index,1)
      }
    },

    search : function(page){
      count = this.totalCount
      if(this.expressStr===null||this.expressStr.length==0){
        alert("请输入");
        return
      }
      this.resList.splice(0,this.resList.length);

      var searchContent = this.expressStr;

      var changeSearchContent = searchContent.replace(/\&/g,"9").replace(/\|/g,"7");

      console.log(changeSearchContent);
      this.loadingIf[0] = true;
      loadingIf = this.loadingIf;
      console.log(this.loadingIf+"====");
      res = this.resList
      buttonPage = this.buttonPage
      currentPage = this.currentPage
      endPage = this.endPage
      axios.get('/m/s?expression='+changeSearchContent+"&page="+page)
      .then(function (response) {
        console.log(11111111);
        if(res.length!==0){
          res.splice(0,res.length)
        }

        for(var value of response.data.c){
          res.push(value)
        }

        buttonPage.splice(0,buttonPage.length)

        currentPage[0] = response.data.cpage
        totalCount = response.data.count
        totalPage = Math.ceil(response.data.count/20)
        if (currentPage[0]-2<=1) {
          for (var i = currentPage-1; i>0; i--) {
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
            buttonPage.splice(frontIndex,0,i)
          }
        }else{
          // buttonPage.push(currentPage)
          buttonPage.push(currentPage[0]+1)
          buttonPage.push(currentPage[0]+2)
          buttonPage.push(totalPage)
        }

        endPage[0] = totalPage
        loadingIf[0] = false
        count[0] = totalCount

      })
      .catch(function (error) {
        console.log(error);
        loadingIf[0] = false
      });
    },

    cart : function(index){
      this.cartList.push(index);
    },
  }
})
