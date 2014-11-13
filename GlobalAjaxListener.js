!(function () {
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
    if (window.XMLHttpRequest) {
        var GlobalAjaxListener = {
            //是否支持重定向，不能跨域
            redirectSupport:false,
            //xhr为扩展对象，含有属性 method,url,async,data
            beforeSend: function (xhr) {
                //发送前
//              xhr.setRequestHeader("myCustomRequestHeader","i am ulyn");
            },
            complete: function (xhr) {
//              //完成请求
                console.info(xhr);
//              console.info(xhr.getAllResponseHeaders());
//              console.info(xhr.getResponseHeader("Status"));
            }
        };
        var completeBridge = function(xhr){
            if(GlobalAjaxListener.redirectSupport){
                var location = xhr.getResponseHeader("Location");
                if(xhr.getResponseHeader("status") == 302 && location){
                    //重定向
                    window.location.href = location;
                    return;
                }
            }
            GlobalAjaxListener.complete(xhr);
        }
        GlobalAjaxListener._tempOpen = XMLHttpRequest.prototype.open;
        GlobalAjaxListener._tempSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url, async) {
            if (!method) method = '';
            if (!url) url = '';
            this.method = method;
            this.url = url;
            this.async = async;
            if (method.toLowerCase() == 'get') {
                this.data = url.split('?')[1];
            }
            GlobalAjaxListener._tempOpen.apply(this, arguments);
        }
        XMLHttpRequest.prototype.send = function (data) {
            var xhr = this;
            if(this.method.toLowerCase() == 'post'){
                this.data = data;
            }

            var _onreadystatechange = xhr.onreadystatechange;
            xhr.onreadystatechange = function () {
                if(xhr.readyState==4 && xhr.status==200){
                    xhr._GlobalAjaxListenerComplete = true;
                    completeBridge(xhr);
                }
                _onreadystatechange && _onreadystatechange();
            }
            xhr._onreadystatechange = xhr.onreadystatechange;
            GlobalAjaxListener.beforeSend(xhr);
            GlobalAjaxListener._tempSend.apply(xhr, arguments);
        }

        if(jQuery && $ && jQuery.fn.jquery.split(".")[0] == '1'){
            //兼容jQuery 1.x
            jQuery( document ).ajaxComplete(function( event, xhr, settings ) {
                //测试jQuery1.9会把onreadystatechange又覆盖。此处做监听进行兼容判断
                if(!xhr._onreadystatechange || xhr._onreadystatechange !== xhr.onreadystatechange){
                    if(!xhr._GlobalAjaxListenerComplete){
                        xhr.method = settings.type;
                        xhr.url = settings.url;
                        xhr.async = settings.async;
                        xhr.data = settings.data;
                        completeBridge(xhr);
                    }
                }
            });
        }
    } else {
        console && console.error("This browser does not support XMLHttpRequest.");
    }

    this.GlobalAjaxListener = GlobalAjaxListener;
    // RequireJS && SeaJS
    if (typeof define === 'function') {
        define(function () {
            return GlobalAjaxListener;
        });
    } else if (typeof exports !== 'undefined') {
        module.exports = GlobalAjaxListener;
    } else {

    }

})();