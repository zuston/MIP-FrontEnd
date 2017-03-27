
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

    hoverShowArray : new Array('Z','X','Mass','element','gativity','configuration'),

    loadingIf : [false],

    bandgap : null,
    spacegroup : null,
    // 搜索的表达式
    expression : null,
    expressStr : null,
    // 购物车点选列表
    cartList : [],
    cartListFormual : [],
    partChooseArr : []
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
            this.hoverShowArray.push("sulfur")
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

    // remove : function(index){
    //   if(this.Condition.componentChildren.length>1){
    //     this.Condition.componentChildren.splice(index,1)
    //   }
    // },

    search : function(page,first=false){
      if (first) {
        this.cartList = []
        this.cartListFormual = []
      }
      count = this.totalCount
      if(this.expressStr===null||this.expressStr.length==0){
        alert("请输入");
        return
      }

      this.resList.splice(0,this.resList.length);

      var searchContent = this.expressStr;

      // var changeSearchContent = searchContent.replace(/\&/g,"%").replace(/\|/g,"/");
      var changeSearchContent = encodeURIComponent(searchContent);
      console.log(changeSearchContent);
      this.loadingIf[0] = true;
      loadingIf = this.loadingIf;
      console.log(this.loadingIf+"====");
      res = this.resList
      buttonPage = this.buttonPage
      currentPage = this.currentPage
      endPage = this.endPage
      console.log(changeSearchContent);
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
        totalPage = Math.ceil(response.data.count/10)
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

    chooseAll : function(resList){
      var count = 0;
      for (var i = 0; i < resList.length; i++) {
        if(this.cartList.indexOf(resList[i]._id.$oid)<0){
          this.cartList.push(resList[i]._id.$oid);
          this.cartListFormual.push(resList[i].poscar.comment);
        }else{
          count ++;
        }
      }
      if (count==resList.length) {
        for (var i = 0; i < resList.length; i++) {
          this.cartList.splice(this.cartList.indexOf(resList[i]._id.$oid),1);
          this.cartListFormual.splice(this.cartListFormual.indexOf(resList[i].poscar.comment),1);
        }
      }
    },

    isAll : function(resList){
      var count = 0;
      for (var i = 0; i < resList.length; i++) {
        if(this.cartList.indexOf(resList[i]._id.$oid)>=0){
          count ++;
        }
      }

      if(count==resList.length){
        return true;
      }
      return false;
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

      if (tag=='8B') {
        this.partChooseArr = [];
        this.partChooseArr.push('Fe');
        this.partChooseArr.push('Ru');
        this.partChooseArr.push('Os');
        this.partChooseArr.push('Hs');

        this.partChooseArr.push('Co');
        this.partChooseArr.push('Rh');
        this.partChooseArr.push('Ir');
        this.partChooseArr.push('Mt');

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
    }
  }
})
