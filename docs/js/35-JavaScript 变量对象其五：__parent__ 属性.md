# JavaScript 变量对象其五：\_\_parent\_\_ 属性

> [原文](https://web.archive.org/web/20210423081947/http://www.nowamagic.net/librarys/veda/detail/1674)

前面已经提到过，按标准规范，活动对象是不可能被直接访问到的。但是，一些具体实现并没有完全遵守这个规定，例如 SpiderMonkey 和 Rhino；的实现中，函数有一个特殊的属性 `__parent__`，通过这个属性可以直接引用到活动对象（或全局变量对象），在此对象里创建了函数。

例如 (SpiderMonkey, Rhino)：

```js
var global = this
var a = 10

function foo() {}
alert(foo.__parent__) // global

var VO = foo.__parent__

alert(VO.a) // 10
alert(VO === global) // true
```

在上面的例子中我们可以看到，函数 foo 是在全局上下文中创建的，所以属性 `__parent__` 指向全局上下文的变量对象，即全局对象。

然而，在 SpiderMonkey 中用同样的方式访问活动对象是不可能的：在不同版本的 SpiderMonkey 中，内部函数的 `__parent__` 有时指向 null ，有时指向全局对象。

在 Rhino 中，用同样的方式访问活动对象是完全可以的。

例如 (Rhino)：

```js
var global = this
var x = 10

;(function foo() {
  var y = 20

  // "foo"上下文里的活动对象
  var AO = function () {}.__parent__
  print(AO.y) // 20

  // 当前活动对象的__parent__ 是已经存在的全局对象
  // 变量对象的特殊链形成了
  // 所以我们叫做作用域链
  print(AO.__parent__ === global) // true
  print(AO.__parent__.x) // 10
})()
```

总结

在这篇文章里，我们深入学习了跟执行上下文相关的对象。我希望这些知识对您来说能有所帮助，能解决一些您曾经遇到的问题或困惑。按照计划，在后续的章节中，我们将探讨作用域链，标识符解析，闭包。
