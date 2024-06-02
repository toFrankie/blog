# JavaScript 变量对象其二：VO 在不同的执行上下文中

> [原文](https://web.archive.org/web/20210423083804/http://www.nowamagic.net/librarys/veda/detail/1671)

## 不同执行上下文中的变量对象

对于所有类型的执行上下文来说，变量对象的一些操作(如变量初始化)和行为都是共通的。从这个角度来看，把变量对象作为抽象的基本事物来理解更为容易。同样在函数上下文中也定义和变量对象相关的额外内容。

```txt
抽象变量对象VO (变量初始化过程的一般行为)
  ║
  ╠══> 全局上下文变量对象GlobalContextVO
  ║        (VO === this === global)
  ║
  ╚══> 函数上下文变量对象FunctionContextVO
           (VO === AO, 并且添加了<arguments>和<formal parameters>)
```

我们来详细看一下：

## 全局上下文中的变量对象

首先，我们要给全局对象一个明确的定义：

> 全局对象(Global object) 是在进入任何执行上下文之前就已经创建了的对象。这个对象只存在一份，它的属性在程序中任何地方都可以访问，全局对象的生命周期终止于程序退出那一刻。

全局对象初始创建阶段将 Math、String、Date、parseInt 作为自身属性，等属性初始化，同样也可以有额外创建的其它对象作为属性（其可以指向到全局对象自身）。例如，在 DOM 中，全局对象的 window 属性就可以引用全局对象自身(当然，并不是所有的具体实现都是这样)：

```js
global = {
  Math: <...>,
  String: <...>
  ...
  ...
  window: global //引用自身
};
```

当访问全局对象的属性时通常会忽略掉前缀，这是因为全局对象是不能通过名称直接访问的。不过我们依然可以通过全局上下文的 this 来访问全局对象，同样也可以递归引用自身。例如，DOM 中的 window。综上所述，代码可以简写为：

```js
String(10) // 就是global.String(10);

// 带有前缀
window.a = 10 // === global.window.a = 10 === global.a = 10;
this.b = 20 // global.b = 20;
```

因此，回到全局上下文中的变量对象——在这里，变量对象就是全局对象自己：

```js
var a = new String('test')

alert(a) // 直接访问，在VO(globalContext)里找到："test"

alert(window['a']) // 间接通过global访问：global === VO(globalContext): "test"
alert(a === this.a) // true

var aKey = 'a'
alert(window[aKey]) // 间接通过动态属性名称访问："test"
```

## 函数上下文中的变量对象

在函数执行上下文中，VO 是不能直接访问的，此时由活动对象(activation object,缩写为 AO)扮演 VO 的角色。

```js
VO(functionContext) === AO
```

活动对象是在进入函数上下文时刻被创建的，它通过函数的 arguments 属性初始化。arguments 属性的值是 Arguments 对象：

```js
AO = {
  arguments: <ArgO>
};
```

Arguments 对象是活动对象的一个属性，它包括如下属性：

1. callee — 指向当前函数的引用
2. length — 真正传递的参数个数
3. properties-indexes (字符串类型的整数) 属性的值就是函数的参数值(按参数列表从左到右排列)。 properties-indexes 内部元素的个数等于 arguments.length. properties-indexes 的值和实际传递进来的参数之间是共享的。

例如：

```js
function foo(x, y, z) {
  // 声明的函数参数数量arguments (x, y, z)
  alert(foo.length) // 3

  // 真正传进来的参数个数(only x, y)
  alert(arguments.length) // 2

  // 参数的callee是函数自身
  alert(arguments.callee === foo) // true

  // 参数共享
  alert(x === arguments[0]) // true
  alert(x) // 10

  arguments[0] = 20
  alert(x) // 20

  x = 30
  alert(arguments[0]) // 30

  // 不过，没有传进来的参数z，和参数的第3个索引值是不共享的
  z = 40
  alert(arguments[2]) // undefined

  arguments[2] = 50
  alert(z) // 40
}

foo(10, 20)
```

这个例子的代码，在当前版本的 Google Chrome 浏览器里有一个 bug — 即使没有传递参数 z，z 和 arguments[2] 仍然是共享的。
