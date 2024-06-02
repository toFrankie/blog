# JavaScript 变量对象其一：VO 的声明

> [原文](https://web.archive.org/web/20210423084400/http://www.nowamagic.net/librarys/veda/detail/1670)

JavaScript 编程的时候总避免不了声明函数和变量，以成功构建我们的系统，但是解释器是如何并且在什么地方去查找这些函数和变量呢？我们引用这些对象的时候究竟发生了什么？

大多数 ECMAScript 程序员应该都知道变量与执行上下文有密切关系：

```js
var a = 10 // 全局上下文中的变量

;(function () {
  var b = 20 // function上下文中的局部变量
})()

alert(a) // 10
alert(b) // 全局变量 "b" 没有声明
```

并且，很多程序员也都知道，当前 ECMAScript 规范指出独立作用域只能通过“函数(function)”代码类型的执行上下文创建。也就是说，相对于 C/C++来说，ECMAScript 里的 for 循环并不能创建一个局部的上下文。

```js
for (var k in { a: 1, b: 2 }) {
  alert(k)
}

alert(k) // 尽管循环已经结束但变量k依然在当前作用域
```

我们来看看一下，我们声明数据的时候到底都发现了什么细节。

## 数据声明

如果变量与执行上下文相关，那变量自己应该知道它的数据存储在哪里，并且知道如何访问。这种机制称为变量对象(variable object)。

变量对象(缩写为 VO)是一个与执行上下文相关的特殊对象，它存储着在上下文中声明的以下内容：

- 变量 (var, 变量声明);
- 函数声明 (FunctionDeclaration, 缩写为 FD);
- 函数的形参

举例来说，我们可以用普通的 ECMAScript 对象来表示一个变量对象：

```js
VO = {}
```

就像我们所说的, VO 就是执行上下文的属性(property)：

```js
activeExecutionContext = {
  VO: {
    // 上下文数据（var, FD, function arguments)
  },
}
```

只有全局上下文的变量对象允许通过 VO 的属性名称来间接访问(因为在全局上下文里，全局对象自身就是变量对象，稍后会详细介绍)，在其它上下文中是不能直接访问 VO 对象的，因为它只是内部机制的一个实现。

当我们声明一个变量或一个函数的时候，和我们创建 VO 新属性的时候一样没有别的区别（即：有名称以及对应的值）。例如：

```js
var a = 10

function test(x) {
  var b = 20
}

test(30)
```

对应的变量对象是：

```js
// 全局上下文的变量对象
VO(globalContext) = {
  a: 10,
  test: <reference to function>
};

// test函数上下文的变量对象
VO(test functionContext) = {
  x: 30,
  b: 20
};
```

在具体实现层面(以及规范中)变量对象只是一个抽象概念。从本质上说，在具体执行上下文中，VO 名称是不一样的，并且初始结构也不一样。
