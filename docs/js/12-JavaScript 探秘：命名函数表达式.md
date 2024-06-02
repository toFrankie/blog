# JavaScript 探秘：命名函数表达式

> [原文](https://web.archive.org/web/20210414195700/http://www.nowamagic.net/librarys/veda/detail/1634)

函数表达式在实际应用中还是很常见的，在 web 开发中友个常用的模式是基于对某种特性的测试来伪装函数定义，从而达到性能优化的目的，但由于这种方式都是在同一作用域内，所以基本上一定要用函数表达式：

```js
// 该代码来自 Garrett Smith 的 APE Javascript library 库(http://dhtmlkitchen.com/ape/)
var contains = (function () {
  var docEl = document.documentElement

  if (typeof docEl.compareDocumentPosition != 'undefined') {
    return function (el, b) {
      return (el.compareDocumentPosition(b) & 16) !== 0
    }
  } else if (typeof docEl.contains != 'undefined') {
    return function (el, b) {
      return el !== b && el.contains(b)
    }
  }
  return function (el, b) {
    if (el === b) return false
    while (el != b && (b = b.parentNode) != null);
    return el === b
  }
})()
```

提到命名函数表达式，理所当然，就是它得有名字，前面的例子 var bar = function foo(){};就是一个有效的命名函数表达式，但有一点需要记住：这个名字只在新定义的函数作用域内有效，因为规范规定了标示符不能在外围的作用域内有效：

```js
var f = function foo() {
  return typeof foo // foo是在内部作用域内有效
}
// foo在外部用于是不可见的
typeof foo // "undefined"
f() // "function"
```

既然，这么要求，那命名函数表达式到底有啥用啊？为啥要取名？

正如我们开头所说：给它一个名字就是可以让调试过程更方便，因为在调试的时候，如果在调用栈中的每个项都有自己的名字来描述，那么调试过程就太爽了，感受不一样嘛。
