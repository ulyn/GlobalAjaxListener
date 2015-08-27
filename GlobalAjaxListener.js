"use strict";
(function (factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals
        window.GlobalAjaxListener = factory();
    }
}(function () {
    // Added for IE5,6 support
    if (window && !window.XMLHttpRequest && window.ActiveXObject) {
        window.XMLHttpRequest = function () {
            try {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
//            可能浏览器版本小于IE5
            }
        };
    }
    if (window && !window.XMLHttpRequest) {
        console && console.error("This browser does not support XMLHttpRequest.");
        return;
    }
    //定义监听器
    var OriXMLHttpRequest = window.XMLHttpRequest;
    function GlobalAjaxListener(){

    }
//    GlobalAjaxListener.prototype.onRedirectResponse = function(url,xhr){};//支持重定向处理，不能跨域
    GlobalAjaxListener.prototype.beforeSend = function (xhr) {
        //发送前
        //              xhr.setRequestHeader("myCustomRequestHeader","i am ulyn");
    };
    GlobalAjaxListener.prototype.extend = function(opts){
        for(var key in opts){
            if(key == 'extend' || key == 'xhrOpen' || key == 'xhrSend' || key == 'abort'){
                continue;
            }
            this[key] = opts[key] || this[key];
        }
    };
    GlobalAjaxListener.prototype.xhrOpen = OriXMLHttpRequest.prototype.open;
    GlobalAjaxListener.prototype.xhrSend = OriXMLHttpRequest.prototype.send;
    GlobalAjaxListener.prototype.onResponse = function (xhr) {
        //              //完成请求
//                    console.info("onResponse",xhr);
        //              console.info(xhr.getAllResponseHeaders());
        //              console.info(xhr.getResponseHeader("Status"));
    };
    GlobalAjaxListener.prototype.abort = function(xhr){
        xhr.listenerParams.isAbort = true;
        try{
            xhr.abort();
        }catch (e){
            console && console.error(e);
        }
    };

    var listener = new GlobalAjaxListener();
    OriXMLHttpRequest.prototype.listenerParams = {
        headers:{},
        data:null
    };
    var SetHttpHeader = OriXMLHttpRequest.prototype.setRequestHeader;
    OriXMLHttpRequest.prototype.setRequestHeader = function(key,value){
        this.listenerParams.headers[key] = value;
        SetHttpHeader.apply(this,arguments);
    }
    //重写XMLHttpRequest的open，截取请求参数
    OriXMLHttpRequest.prototype.open = function (method, url, async) {
        var requestParams = this.listenerParams;
        requestParams.method = (method && method.toLowerCase()) || '',
        requestParams.url = url,
        requestParams.async = async,
        requestParams.data = null,
        requestParams.isAbort = false;
        if(requestParams.method == 'get'){
            requestParams.data = url.split('?')[1];
        }
        listener.xhrOpen.apply(this, arguments);
    }
    //重写XMLHttpRequest的send，截取返回值
    OriXMLHttpRequest.prototype.send = function (data) {
        var xhr = this;
        var requestParams = xhr.listenerParams;
        if(requestParams.method == 'post'){
            requestParams.data = data;
        }
        var continueSend = listener.beforeSend(xhr);
        if(continueSend === false){
            listener.abort(xhr);
        }else{
            modifyOnreadystatechange(xhr);
        }
    }

    function onResponseBridge(xhr) {
        if (listener.onRedirectResponse) {
            var location = xhr.getResponseHeader("Location");
            if (xhr.getResponseHeader("status") == 302 && location) {
                //重定向
                listener.onRedirectResponse(location,xhr);
                return;
            }
        }
        var status = listener.onResponse(xhr);
        if(status === false){
            listener.abort(xhr);
        }
    };

    function modifyOnreadystatechange(xhr){
        //有些使用onload 而不是用onreadystatechange
        var onreadystatechange = xhr.onreadystatechange;
//        console.info("modifyOnreadystatechange",onreadystatechange);
//        console.info(new Date().getTime());
        var requestParams = xhr.listenerParams;
        if(requestParams.isAbort){
            return;
        }
        if(onreadystatechange == null && xhr.onload == null){
            //当onreadystatechange为空时，延迟处理，因为send可能写在onreadystatechange之前
            setTimeout(function(){ modifyOnreadystatechange(xhr);});
        }else{
//            var modifyProName = xhr.onreadystatechange?"onreadystatechange":"onload";
            xhr.onreadystatechange = function () {
//                console.info(xhr.readyState);
                if(xhr.readyState==4 && xhr.status==200){
//                    console.info(new Date().getTime());
                    onResponseBridge(xhr);
                }
                if(!xhr.listenerParams.isAbort){
                    onreadystatechange && onreadystatechange();
                }
            };
            listener.xhrSend.call(xhr, xhr.listenerParams.data);
//            console.info(new Date().getTime());
        }
    }
    return listener;
}));