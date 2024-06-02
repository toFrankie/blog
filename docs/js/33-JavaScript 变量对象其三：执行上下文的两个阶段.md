# JavaScript 变量对象其三：执行上下文的两个阶段

> [原文](https://web.archive.org/web/20210423083804/http://www.nowamagic.net/librarys/veda/detail/1672)

现在我们终于到了本文的核心点了。执行上下文的代码被分成两个基本的阶段来处理：

1. 进入执行上下文
2. 执行代码

变量对象的修改变化与这两个阶段紧密相关。

注：这 2 个阶段的处理是一般行为，和上下文的类型无关（也就是说，在全局上下文和函数上下文中的表现是一样的）。

## 进入执行上下文

当进入执行上下文(代码执行之前)时，VO 里已经包含了下列属性(前面已经说了)：

- 函数的所有形参(如果我们是在函数执行上下文中) — 由名称和对应值组成的一个变量对象的属性被创建；没有传递对应参数的话，那么由名称和 undefined 值组成的一种变量对象的属性也将被创建。

- 所有函数声明(FunctionDeclaration, FD) —由名称和对应值（函数对象(function-object)）组成一个变量对象的属性被创建；如果变量对象已经存在相同名称的属性，则完全替换这个属性。

- 所有变量声明(var, VariableDeclaration) — 由名称和对应值（undefined）组成一个变量对象的属性被创建；如果变量名称跟已经声明的形式参数或函数相同，则变量声明不会干扰已经存在的这类属性。
  让我们看一个例子：

```js
function test(a, b) {
  var c = 10
  function d() {}
  var e = function _e() {}
  ;(function x() {})
}

test(10) // call
```

当进入带有参数 10 的 test 函数上下文时，AO 表现为如下：

```js
AO(test) = {
  a: 10,
  b: undefined,
  c: undefined,
  d: <reference to FunctionDeclaration "d">,
  e: undefined
}
```

注意，AO 里并不包含函数“x”。这是因为“x” 是一个函数表达式(FunctionExpression, 缩写为 FE) 而不是函数声明，函数表达式不会影响 VO。 不管怎样，函数“\_e” 同样也是函数表达式，但是就像我们下面将看到的那样，因为它分配给了变量 “e”，所以它可以通过名称“e”来访问。 函数声明 FunctionDeclaration 与函数表达式 FunctionExpression 的不同，可以参考前面的专题文章。

这之后，将进入处理上下文代码的第二个阶段 — 执行代码。

## 代码执行

这个周期内，AO/VO 已经拥有了属性(不过，并不是所有的属性都有值，大部分属性的值还是系统默认的初始值 undefined )。还是前面那个例子，AO/VO 在代码解释期间被修改如下：

```js
AO['c'] = 10;
AO['e'] = <reference to FunctionExpression "_e">;
```

再次注意，因为 FunctionExpression“\_e”保存到了已声明的变量“e”上，所以它仍然存在于内存中。而 FunctionExpression “x”却不存在于 AO/VO 中，也就是说如果我们想尝试调用“x”函数，不管在函数定义之前还是之后，都会出现一个错误“x is not defined”，未保存的函数表达式只有在它自己的定义或递归中才能被调用。

另一个经典例子：

```js
alert(x) // function

var x = 10
alert(x) // 10

x = 20
function x() {}

alert(x) // 20
```

为什么第一个 alert “x” 的返回值是 function，而且它还是在“x” 声明之前访问的“x” 的？为什么不是 10 或 20 呢？因为，根据规范函数声明是在当进入上下文时填入的； 同意周期，在进入上下文的时候还有一个变量声明“x”，那么正如我们在上一个阶段所说，变量声明在顺序上跟在函数声明和形式参数声明之后，而且在这个进入上下文阶段，变量声明不会干扰 VO 中已经存在的同名函数声明或形式参数声明，因此，在进入上下文时，VO 的结构如下：

```js
VO = {};

VO['x'] = <reference to FunctionDeclaration "x">

// 找到var x = 10;
// 如果function "x"没有已经声明的话
// 这时候"x"的值应该是undefined
// 但是这个case里变量声明没有影响同名的function的值

VO['x'] = <the value is not disturbed, still function>
```

紧接着，在执行代码阶段，VO 做如下修改：

```js
VO['x'] = 10
VO['x'] = 20
```

我们可以在第二、三个 alert 看到这个效果。

在下面的例子里我们可以再次看到，变量是在进入上下文阶段放入 VO 中的。(因为，虽然 else 部分代码永远不会执行，但是不管怎样，变量“b”仍然存在于 VO 中。)

```js
if (true) {
  var a = 1
} else {
  var b = 2
}

alert(a) // 1
alert(b) // undefined,不是b没有声明，而是b的值是undefined
```
