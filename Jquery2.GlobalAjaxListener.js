!(function () {
    var GlobalAjaxListener = {
        redirectSupport:false,
        //xhr为扩展对象，含有属性 method,url,async,data
        beforeSend: function (xhr) {
            //发送前
//              xhr.setRequestHeader("myCustomRequestHeader","i am ulyn");
        },
        complete: function (xhr) {
//              //完成请求
//            console.info(xhr);
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

    jQuery( document ).ajaxSend(function( event, xhr, settings ) {
        xhr.method = settings.type;
        xhr.url = settings.url;
        xhr.async = settings.async;
        xhr.data = settings.data;
        GlobalAjaxListener.beforeSend(xhr);
    });
    jQuery( document ).ajaxComplete(function( event, xhr, settings ) {
        xhr.method = settings.type;
        xhr.url = settings.url;
        xhr.async = settings.async;
        xhr.data = settings.data;
        completeBridge(xhr);
    });

    jQuery.GlobalAjaxListener = this.GlobalAjaxListener = GlobalAjaxListener;
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