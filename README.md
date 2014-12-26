GlobalAjaxListener - 全局ajax监听器
==================

有时候我们的页面很多操作都是ajax,现在我们有个需求，我们想知道到底执行了哪些请求或者请求时候我们想统一加一个请求头。那么我们在不改变代码的情况下该如何实现？

浏览器ajax的对象XMLHttpRequest本身自己就是一个javascript对象，无非是调用执行它进行请求响应。没错，我们就是改变重写它！

# GlobalAjaxListener 对象#

1、获取GlobalAjaxListener对象：GlobalAjaxListener（非模块化的则暴露在window）   
2、初始化参数：

	GlobalAjaxListener.extend(opts)

对象属性：

字段 | 类型 | 默认值| 说明
------------ | ------------- | ------------ | ------------
redirectSupport | boolean | ``false`` | 是否支持重定向，不能跨域
beforeSend | function(xhr) | ``空函数`` | 当请求发送之前调用
onResponse | function(xhr) | ``空函数`` | 当请求响应内容后调用,当返回false时，停止往下执行
extend | function(opts) | ```` | 扩展定义对象
abort | function(xhr) | ```` | 请求中断


其中xhr对象为XMLHttpRequest，从中扩展属性GlobalAjaxListenerParmas，如下

字段 | 类型 | 默认值| 说明
------------ | ------------- | ------------ | ------------
method | string | ``''`` | 请求方式post或get
url | string | ``null`` | 请求url
async | boolean | ``null`` | 请求是否异步
data | string | ``null`` | 请求参数
isAbort | boolean | ``false`` | 是否中断请求执行


3.请求中断：

	GlobalAjaxListener.abort(xhr);

注：初始化操作需要在发起ajax之前完成。

# 原理简述 #

浏览器发起ajax基于XMLHttpRequest/ActiveXObject对象，对象有统一的接口，整个请求流程必定调用是open、send、onreadystatechange。所以只要我们重写open、send、onreadystatechange即可做一些我们想要的事情。

事情并不简单，onreadystatechange是外部函数，当send的时候，我们需要把外部函数再进行一次封装，然而，事与愿违，有些人喜欢这样写：

	xmlHttpReq.open("get", "README.md", true);
    xmlHttpReq.send(null);
    xmlHttpReq.onreadystatechange =  function() {}

当这样写的时候，send对onreadystatechange进行封装也没用，外部又对它进行重新定义。
我们该怎么办呢？本能想onreadystatechange赋值的时候，我再对它进行改写。ES6有对象属性监听回调的方法，但是对于兼容性来讲，目前不适合。那么不然我们就这样做吧：认为onreadystatechange外部调用时候只会赋值一次，当send的时候，写个定时器判断onreadystatechange的变化（初始时候它为空），当变化时候就达到目的改写了！

然后，更甚者，jquery2使用onload，而不定义onreadystatechange。对onreadystatechange的空值判断变成了死循环！！好吧，那我再对onload进行判断，当onload定义的时候，即可进行改写。

经测试，此版本兼容jquery1.4以上。

建议：onreadystatechange或者onload写在send之前~