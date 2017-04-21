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
      numberArr.push(getStrStartFrom(str,index));
      elementArr.push(getStrEndFrom(str,index));
    }else{
      numberArr.push("");
      element.push(str);
    }
  }
  res[0] = numberArr;
  res[1] = elementArr;
  return res;
}

function getStrStartFrom(originString,index,end=0){
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

function getStrEndFrom(originString,index,start=0){
  var resString = "";
  for (var i = start; i < index; i++) {
    resString += originString[i];
  }
  return resString;
}
