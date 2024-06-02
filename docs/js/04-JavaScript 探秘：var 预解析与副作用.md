# JavaScript 探秘：var 预解析与副作用

> [原文](https://web.archive.org/web/20210414200729/http://www.nowamagic.net/librarys/veda/detail/1623)

## var 的副作用

隐式全局变量和明确定义的全局变量间有些小的差异，就是通过 delete 操作符让变量未定义的能力。

- 通过 var 创建的全局变量（任何函数之外的程序中创建）是不能被删除的。
- 无 var 创建的隐式全局变量（无视是否在函数中创建）是能被删除的。

这表明，在技术上，隐式全局变量并不是真正的全局变量，但它们是全局对象的属性。属性是可以通过 delete 操作符删除的，而变量是不能的：

```js
// 定义三个全局变量
var global_var = 1
global_novar = 2 // 反面教材
;(function () {
  global_fromfunc = 3 // 反面教材
})()

// 试图删除
delete global_var // false
delete global_novar // true
delete global_fromfunc // true

// 测试该删除
typeof global_var // "number"
typeof global_novar // "undefined"
typeof global_fromfunc // "undefined"
```

在 ES5 严格模式下，未声明的变量（如在前面的代码片段中的两个反面教材）工作时会抛出一个错误。

## 单 var 形式

在函数顶部使用单 var 语句是比较有用的一种形式，其好处在于：

- 提供了一个单一的地方去寻找功能所需要的所有局部变量
- 防止变量在定义之前使用的逻辑错误
- 帮助你记住声明的全局变量，因此较少了全局变量//zxx:此处我自己是有点晕乎的…
- 少代码（类型啊传值啊单线完成）

单 var 形式长得就像下面这个样子：

```js
function func() {
  var a = 1,
    b = 2,
    sum = a + b,
    myobject = {},
    i,
    j
  // function body...
}
```

您可以使用一个 var 语句声明多个变量，并以逗号分隔。像这种初始化变量同时初始化值的做法是很好的。这样子可以防止逻辑错误（所有未初始化但声明的变量的初始值是 undefined）和增加代码的可读性。在你看到代码后，你可以根据初始化的值知道这些变量大致的用途，例如是要当作对象呢还是当作整数来使。

你也可以在声明的时候做一些实际的工作，例如前面代码中的 sum = a + b 这个情况，另外一个例子就是当你使用 DOM（文档对象模型）引用时，你可以使用单一的 var 把 DOM 引用一起指定为局部变量，就如下面代码所示的：

```js
function updateElement() {
  var el = document.getElementById('result'),
    style = el.style
  // 使用el和style干点其他什么事...
}
```

## vars 变量预解析

JavaScript 中，你可以在函数的任何位置声明多个 var 语句，并且它们就好像是在函数顶部声明一样发挥作用，这种行为称为 hoisting（悬置/置顶解析/预解析）。当你使用了一个变量，然后不久在函数中又重新声明的话，就可能产生逻辑错误。对于 JavaScript，只要你的变量是在同一个作用域中（同一函数），它都被当做是声明的，即使是它在 var 声明前使用的时候。看下面这个例子：

```js
// 反例
myname = 'global' // 全局变量
function func() {
  alert(myname) // "undefined"
  var myname = 'local'
  alert(myname) // "local"
}
func()
```

在这个例子中，你可能会以为第一个 alert 弹出的是”global”，第二个弹出”loacl”。这种期许是可以理解的，因为在第一个 alert 的时候，myname 未声明，此时函数肯定很自然而然地看全局变量 myname，但是，实际上并不是这么工作的。第一个 alert 会弹 出”undefined”是因为 myname 被当做了函数的局部变量（尽管是之后声明的），所有的变量声明当被悬置到函数的顶部了。因此，为了避免这种混乱，最好是预先声明你想使用的全部变量。

上面的代码片段执行的行为可能就像下面这样：

```js
myname = "global"; // global variable
function func() {
   var myname; // 等同于 -> var myname = undefined;
   alert(myname); // "undefined"
   myname = "local";
   alert(myname); // "local"}
func();
```

为了完整，我们再提一提执行层面的稍微复杂点的东西。代码处理分两个阶段，第一阶段是变量，函数声明，以及正常格式的参数创建，这是一个解析和进入上下文 的阶段。第二个阶段是代码执行，函数表达式和不合格的标识符（为声明的变量）被创建。但是，出于实用的目的，我们就采用了”hoisting”这个概念， 这种 ECMAScript 标准中并未定义，通常用来描述行为。

## 访问全局对象

在浏览器中，全局对象可以通过 window 属性在代码的任何位置访问（除非你做了些比较出格的事情，像是声明了一个名为 window 的局部变量）。但是在其他环境下，这个方便的属性可能被叫做其他什么东西（甚至在程序中不可用）。如果你需要在没有硬编码的 window 标识符下访问全局对象，你可以在任何层级的函数作用域中做如下操作：

```js
var global = (function () {
  return this
})()
```

这种方法可以随时获得全局对象，因为其在函数中被当做函数调用了（不是通过 new 构造），this 总是指向全局对象。实际上这个病不适用于 ECMAScript 5 严格模式，所以，在严格模式下时，你必须采取不同的形式。例如，你正在开发一个 JavaScript 库，你可以将你的代码包裹在一个即时函数中，然后从全局作用域中，传递一个引用指向 this 作为你即时函数的参数。
