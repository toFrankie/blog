# JavaScript 探秘：命名函数表达式替代方案

> [原文](https://web.archive.org/web/20210423073835/http://www.nowamagic.net/librarys/veda/detail/1639)

其实，如果我们不想要这个描述性名字的话，我们就可以用最简单的形式来做，也就是在函数内部声明一个函数（而不是函数表达式），然后返回该函数：

```js
var hasClassName = (function () {
  // 定义私有变量
  var cache = {}

  // 使用函数声明
  function hasClassName(element, className) {
    var _className = '(?:^|\\s+)' + className + '(?:\\s+|$)'
    var re = cache[_className] || (cache[_className] = new RegExp(_className))
    return re.test(element.className)
  }

  // 返回函数
  return hasClassName
})()
```

显然，当存在多个分支函数定义时，这个方案就不行了。不过有种模式貌似可以实现：那就是提前使用函数声明来定义所有函数，并分别为这些函数指定不同的标识符：

```js
var addEvent = (function(){

  var docEl = document.documentElement;

  function addEventListener(){
    /* ... */
  }
  function attachEvent(){
    /* ... */
  }
  function addEventAsProperty(){
    /* ... */
  }

  if (typeof docEl.addEventListener != 'undefined') {
    return addEventListener;
  }
  elseif (typeof docEl.attachEvent != 'undefined') {
    return attachEvent;
  }
  return addEventAsProperty;
})();
```

虽然这个方案很优雅，但也不是没有缺点。第一，由于使用不同的标识符，导致丧失了命名的一致性。且不说这样好还是坏，最起码它不够清晰。有人喜欢使用相同的名字，但也有人根本不在乎字眼上的差别。可毕竟，不同的名字会让人联想到所用的不同实现。例如，在调试器中看到 attachEvent，我们就知 道 addEvent 是基于 attachEvent 的实现。当 然，基于实现来命名的方式也不一定都行得通。假如我们要提供一个 API，并按照这种方式把函数命名为 inner。那么 API 用户的很容易就会被相应实现的 细节搞得晕头转向。

要解决这个问题，当然就得想一套更合理的命名方案了。但关键是不要再额外制造麻烦。我现在能想起来的方案大概有如下几个：

```js
'addEvent', 'altAddEvent', 'fallbackAddEvent'
// 或者
'addEvent', 'addEvent2', 'addEvent3'
// 或者
'addEvent_addEventListener', 'addEvent_attachEvent', 'addEvent_asProperty'
```

另外，这种模式还存在一个小问题，即增加内存占用。提前创建 N 个不同名字的函数，等于有 N-1 的函数是用不到的。具体来讲，如果 document.documentElement 中包含 attachEvent，那么 addEventListener 和 addEventAsProperty 则根本就用不着了。可是，他们都占着内存哪；而且，这些内存将永远都得不到释放，原因跟 JScript 臭哄哄的命名表达式相同——这两个函数都被“截留”在返回的那个函数的闭包中了。

不过，增加内存占用这个问题确实没什么大不了的。如果某个库——例如 Prototype.js——采用了这种模式，无非也就是多创建一两百个函数而已。只要不是（在运行时）重复地创建这些函数，而是只（在加载时）创建一次，那么就没有什么好担心的。
