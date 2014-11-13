GlobalAjaxListener - 全局ajax监听器
==================

有时候我们的页面很多操作都是ajax,现在我们有个需求，我们想知道到底执行了哪些请求或者请求时候我们想统一加一个请求头。那么我们在不改变代码的情况下该如何实现？

浏览器ajax的对象XMLHttpRequest本身自己就是一个javascript对象，无非是调用执行它进行请求响应。没错，我们就是改变重写它！

# GlobalAjaxListener 对象#

使用非常简单，重写GlobalAjaxListener的方法即可。具体看下面对象注释吧！   

	var GlobalAjaxListener = {
            redirectSupport:false,
            //xhr为扩展对象，含有属性 method,url,async,data
            beforeSend: function (xhr) {
                //发送前
	//              xhr.setRequestHeader("myCustomRequestHeader","i am ulyn");
            },
            complete: function (xhr) {
	//              //完成请求
    //              console.info(xhr);
	//              console.info(xhr.getAllResponseHeaders());
	//              console.info(xhr.getResponseHeader("Status"));
            }
        };

# 注意版本 #
当ajax使用的太过分了，导致xhr对象都给重写了，GlobalAjaxListener是无法实现监听到完成事件的。比如jquery2以上的版本，请用Jquery2.GlobalAjaxListener.js