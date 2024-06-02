# JavaScript 探秘：SpiderMonkey 的怪癖

> [原文](https://web.archive.org/web/20210414192806/http://www.nowamagic.net/librarys/veda/detail/1638)

大家都知道，命名函数表达式的标识符只在函数的局部作用域中有效。但包含这个标识符的局部作用域又是什么样子的吗？其实非常简单。在命名函数表达式被求值时，会创建一个特殊的对象，该对象的唯一目的就是保存一个属性，而这个属性的名字对应着函数标识符，属性的值对应着那个函数。这个对象会被注入到当前作用域链的前端。然后，被“扩展”的作用域链又被用于初始化函数。

在这里，有一点十分有意思，那就是 ECMA-262 定义这个（保存函数标识符的）“特殊”对象的方式。标准说“像调用 new Object()表达式那样”创建这个对象。如果从字面上来理解这句话，那么这个对象就应该是全局 Object 的一个实例。然而，只有一个实现是按照标准字面上的要求这么做的，这个实现就是 SpiderMonkey。因此，在 SpiderMonkey 中，扩展 Object.prototype 有可能会干扰函数的局部作用域：

```js
Object.prototype.x = 'outer'
;(function () {
  var x = 'inner'

  /*
    函数foo的作用域链中有一个特殊的对象——用于保存函数的标识符。这个特殊的对象实际上就是{ foo: <function object> }。
    当通过作用域链解析x时，首先解析的是foo的局部环境。如果没有找到x，则继续搜索作用域链中的下一个对象。下一个对象
    就是保存函数标识符的那个对象——{ foo: <function object> }，由于该对象继承自Object.prototype，所以在此可以找到x。
    而这个x的值也就是Object.prototype.x的值（outer）。结果，外部函数的作用域（包含x = 'inner'的作用域）就不会被解析了。
  */

  ;(function foo() {
    alert(x) // 提示框中显示：outer
  })()
})()
```

不过，更高版本的 SpiderMonkey 改变了上述行为，原因可能是认为那是一个安全漏洞。也就是说，“特殊”对象不再继承 Object.prototype 了。不过，如果你使用 Firefox 3 或者更低版本，还可以“重温”这种行为。

另一个把内部对象实现为全局 Object 对象的是黑莓（Blackberry）浏览器。目前，它的活动对象（Activation Object）仍然继承 Object.prototype。可是，ECMA-262 并没有说活动对象也要“像调用 new Object()表达式那样”来创建（或者说像创建保存 NFE 标识符的对象一样创建）。 人家规范只说了活动对象是规范中的一种机制。

好，那我们下面就来看看黑莓浏览器的行为吧：

```js
Object.prototype.x = 'outer'
;(function () {
  var x = 'inner'

  ;(function () {
    /*
    在沿着作用域链解析x的过程中，首先会搜索局部函数的活动对象。当然，在该对象中找不到x。
    可是，由于活动对象继承自Object.prototype，因此搜索x的下一个目标就是Object.prototype；而
    Object.prototype中又确实有x的定义。结果，x的值就被解析为——outer。跟前面的例子差不多，
    包含x = 'inner'的外部函数的作用域（活动对象）就不会被解析了。
    */

    alert(x) // 显示：outer
  })()
})()
```

不过神奇的还是，函数中的变量甚至会与已有的 Object.prototype 的成员发生冲突，来看看下面的代码：

```js
;(function () {
  var constructor = function () {
    return 1
  }

  ;(function () {
    constructor() // 求值结果是{}（即相当于调用了Object.prototype.constructor()）而不是1

    constructor === Object.prototype.constructor // true
    toString === Object.prototype.toString // true

    // ……
  })()
})()
```

要避免这个问题，要避免使用 Object.prototype 里的属性名称，如 toString, valueOf, hasOwnProperty 等等。

JScript 解决方案

```js
var fn = (function () {
  // 声明要引用函数的变量
  var f

  // 有条件地创建命名函数
  // 并将其引用赋值给f
  if (true) {
    f = function F() {}
  } else if (false) {
    f = function F() {}
  } else {
    f = function F() {}
  }

  // 声明一个与函数名（标识符）对应的变量，并赋值为null
  // 这实际上是给相应标识符引用的函数对象作了一个标记，
  // 以便垃圾回收器知道可以回收它了
  var F = null

  // 返回根据条件定义的函数
  return f
})()
```

最后我们给出一个应用上述技术的应用实例，这是一个跨浏览器的 addEvent 函数代码：

```js
// 1) 使用独立的作用域包含声明
var addEvent = (function () {
  var docEl = document.documentElement

  // 2) 声明要引用函数的变量
  var fn

  if (docEl.addEventListener) {
    // 3) 有意给函数一个描述性的标识符
    fn = function addEvent(element, eventName, callback) {
      element.addEventListener(eventName, callback, false)
    }
  } else if (docEl.attachEvent) {
    fn = function addEvent(element, eventName, callback) {
      element.attachEvent('on' + eventName, callback)
    }
  } else {
    fn = function addEvent(element, eventName, callback) {
      element['on' + eventName] = callback
    }
  }

  // 4) 清除由JScript创建的addEvent函数
  //    一定要保证在赋值前使用var关键字
  //    除非函数顶部已经声明了addEvent
  var addEvent = null

  // 5) 最后返回由fn引用的函数
  return fn
})()
```
