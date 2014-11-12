GlobalAjaxListener - 全局ajax监听器
==================

有时候我们的页面很多操作都是ajax,现在我们有个需求，我们想知道到底执行了哪些请求或者请求时候我们想统一加一个请求头。那么我们在不改变代码的情况下该如何实现？

浏览器ajax的对象XMLHttpRequest本身自己就是一个javascript对象，无非是调用执行它进行请求响应。没错，我们就是改变重写它！

# GlobalAjaxListener 对象#

使用非常简单，重写GlobalAjaxListener的方法即可。具体看下面对象注释吧！   

	var GlobalAjaxListener = {
            //xhr为扩展对象，含有属性 method,url,async,data
            open: function (xhr) {
            },
            beforeSend: function (xhr) {
                //发送前
                xhr.setRequestHeader("myCustomRequestHeader","i am ulyn");
            },
            onreadystatechange: function (xhr) {
                //每当 readyState 属性改变时，就会调用该函数
                //xhr的onreadystatechange 事件被触发 5 次（0 - 4），对应着 readyState 的每个变化。
                //但是此处因为xhr的onreadystatechange会被重写，因此我们保险起见，不复杂写
                // ，只针对send的时候调用，所以readyState是从2开始的。
	//                console.info(xhr.readyState);
	//                if (xhr.readyState==4 && xhr.status==200)
	//                {
	//                    //完成请求
	//                    console.info(xhr);
	//                    console.info(xhr.getAllResponseHeaders());
	//                    console.info(xhr.getResponseHeader("Status"));
	//                }
	            
		}
      
 	};

