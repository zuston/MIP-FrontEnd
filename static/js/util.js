//无空格角标生成算法
function analyStringNew(ostring){
  var res = []
  var numberArr = []
  var elementArr = []

  var english = 0;
  var numberStart = -1;
  var numberEnd = -1;
  for (var i = 0; i < ostring.length; i++) {
    //是数字
    if (!isNaN(ostring[i])&&numberStart==-1) {
      numberStart = i;
    }
    if ((isNaN(ostring[i])&&numberStart!=-1)||(numberStart!=-1&&i==ostring.length-1)) {
      if (i==ostring.length-1) {
        numberEnd = ostring.length;
      }else{
        numberEnd = i;
      }
      numberArr.push(getStrStartFrom(ostring,numberStart,numberEnd));
      elementArr.push(getStrEndFrom(ostring,numberStart,english));
      english = numberEnd;
      numberStart=-1;
      numberEnd = -1;
    }
  }
  res[0] = numberArr;
  res[1] = elementArr;
  return res;
}



//针对有空格的生成角标算法
function analyString(ostring){
  var res = []
  var numberArr = [];
  var elementArr = [];
  var strArr = ostring.split(" ");
  for (var i = 0; i < strArr.length; i++) {
    var str = strArr[i];
    console.log(str);
    var index = -1;
    for (var j = 0; j < str.length; j++) {
      if(!isNaN(str[j])){
        index = j;
        break;
      }
    }
    if (index!=-1) {
      numberArr.push(getStrStartFrom(str,index,0));
      elementArr.push(getStrEndFrom(str,index,0));
    }else{
      numberArr.push("");
      element.push(str);
    }
  }
  res[0] = numberArr;
  res[1] = elementArr;
  return res;
}

function getStrStartFrom(originString,index,end){
  var resString = "";
  if (end==0) {
    end = originString.length;
  }
  for (var i = index; i < end; i++) {
    resString += originString[i];
  }
  if (resString=="1") {
    return "";
  }
  return resString;
}

function getStrEndFrom(originString,index,start){
  var resString = "";
  for (var i = start; i < index; i++) {
    resString += originString[i];
  }
  return resString;
}

// hashmap 实现
function HashMap(){
    //定义长度
    var length = 0;
    //创建一个对象
    var obj = new Object();

    /**
    * 判断Map是否为空
    */
    this.isEmpty = function(){
        return length == 0;
    };

    /**
    * 判断对象中是否包含给定Key
    */
    this.containsKey=function(key){
        return (key in obj);
    };

    /**
    * 判断对象中是否包含给定的Value
    */
    this.containsValue=function(value){
        for(var key in obj){
            if(obj[key] == value){
                return true;
            }
        }
        return false;
    };

    /**
    *向map中添加数据
    */
    this.put=function(key,value){
        if(!this.containsKey(key)){
            length++;
        }
        obj[key] = value;
    };

    /**
    * 根据给定的Key获得Value
    */
    this.get=function(key){
        return this.containsKey(key)?obj[key]:null;
    };

    /**
    * 根据给定的Key删除一个值
    */
    this.remove=function(key){
        if(this.containsKey(key)&&(delete obj[key])){
            length--;
        }
    };

    /**
    * 获得Map中的所有Value
    */
    this.values=function(){
        var _values= new Array();
        for(var key in obj){
            _values.push(obj[key]);
        }
        return _values;
    };

    /**
    * 获得Map中的所有Key
    */
    this.keySet=function(){
        var _keys = new Array();
        for(var key in obj){
            _keys.push(key);
        }
        return _keys;
    };

    /**
    * 获得Map的长度
    */
    this.size = function(){
        return length;
    };

    /**
    * 清空Map
    */
    this.clear = function(){
        length = 0;
        obj = new Object();
    };
}
