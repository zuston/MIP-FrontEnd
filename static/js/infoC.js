function getUrlParam(name) {
	        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	        var r = window.location.search.substr(1).match(reg);  //匹配目标参数
	        if (r != null) return unescape(r[2]); return null; //返回参数值
	    }
	 function clickRadio(tmpType){
		 if(tmpType=="n_type"){
			 $("#neg").attr("style", "visibility:hidden");  ;
		 }
		 if(tmpType=="p_type"){
			 $("#neg").attr("style", "visibility:visible");  ;
		 }
	 }

	function clickBtn(){
		var tmpdt = new Object();
		if($("#p_type").is(':checked')){
			tmpdt["carr"] = "-"+$("#carr").val();
		}else{
			tmpdt["carr"] = $("#carr").val();
		}
		tmpdt["extract_id"] = getUrlParam('id');
		tmpdt["T"] = $("#T").val();
		tmpdt["deformation_potential"] = $("#deformation_potential").val();
		tmpdt["elastic_constant"] = $("#elastic_constant").val();
		$.ajax({
			 url : "/SpringMVC/ajax_trans_calculate.do",
			 /* url : "http://localhost:8080/SpringMVC/ajax_trans_calculate.do",  */
			type : 'post',
			dataType : "json",
			contentType : "application/json",
			data : JSON.stringify(tmpdt),
			success : function(data, status) {
				if (status == "success") {
					/* alert(data.folderName);
					alert(data.pf);
					alert(data.tp); */
					$("#tp").html(data.tp);
					$("#pf").html(data.pf);
					$("#downloadBtn").attr("href","/SpringMVC/downloadbxsf.do?folderName="+data.folderName);
					$("#resultDiv").show();
				}
			},
			error : function(xhr, textStatus,
					errorThrown) {
				alert(errorThrown);
			}
		});
	}
