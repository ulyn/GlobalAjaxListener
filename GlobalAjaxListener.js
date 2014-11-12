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
            //xhr为扩展对象，含有属性 method,url,async,data
            open: function (xhr) {
            },
            beforeSend: function (xhr) {
                //发送前
//                xhr.setRequestHeader("myCustomRequestHeader","i am ulyn");
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
            GlobalAjaxListener.open(this);
            GlobalAjaxListener._tempOpen.apply(this, arguments);
        }
        XMLHttpRequest.prototype.send = function (data) {
            var self = this;
            if(this.method.toLowerCase() == 'post'){
                this.data = data;
            }

            var _onreadystatechange = self.onreadystatechange;
            self.onreadystatechange = function () {
                GlobalAjaxListener.onreadystatechange(self);
                _onreadystatechange && _onreadystatechange();
            }
            GlobalAjaxListener.beforeSend(self);
            GlobalAjaxListener._tempSend.apply(self, arguments);
        }
    } else {
        console && console.error("This browser does not support XMLHttpRequest.");
    }

    // RequireJS && SeaJS
    if (typeof define === 'function') {
        define(function () {
            return GlobalAjaxListener;
        });
    } else if (typeof exports !== 'undefined') {
        module.exports = GlobalAjaxListener;
    } else {
        this.GlobalAjaxListener = GlobalAjaxListener;
    }

})();