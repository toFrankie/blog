# JavaScript 作用域链其三：作用域链特征

> [原文](https://web.archive.org/web/20190729211612/http://www.nowamagic.net/librarys/veda/detail/1677)

让我们看看与作用域链和函数 `[[Scope]]` 属性相关的一些重要特征。

## 闭包

在 ECMAScript 中，闭包与函数的 `[[Scope]]` 直接相关，正如我们提到的那样， `[[Scope]]` 在函数创建时被存储，与函数共存亡。实际上，闭包是函数代码和其 `[[Scope]]` 的结合。因此，作为其对象之一， `[[Scope]]` 包括在函数内创建的词法作用域（父变量对象）。当函数进一步激活时，在变量对象的这个词法链（静态的存储于创建时）中，来自较高作用域的变量将被搜寻。例如：

```js
var x = 10

function foo() {
  alert(x)
}

;(function () {
  var x = 20
  foo() // 10, but not 20
})()
```

我们再次看到，在标识符解析过程中，使用函数创建时定义的词法作用域－－变量解析为 10，而不是 30。此外，这个例子也清晰的表明，一个函数（这个例子中为从函数“foo”返回的匿名函数）的 `[[Scope]]` 持续存在，即使是在函数创建的作用域已经完成之后。

关于 ECMAScript 中闭包的理论和其执行机制的更多细节以后会讲解。

## 通过构造函数创建的函数的 `[[Scope]]`

在上面的例子中，我们看到，在函数创建时获得函数的 `[[Scope]]` 属性，通过该属性访问到所有父上下文的变量。但是，这个规则有一个重要的例外，它涉及到通过函数构造函数创建的函数。

```js
var x = 10

function foo() {
  var y = 20

  function barFD() {
    // 函数声明
    alert(x)
    alert(y)
  }

  var barFE = function () {
    // 函数表达式
    alert(x)
    alert(y)
  }

  var barFn = Function('alert(x); alert(y);')

  barFD() // 10, 20
  barFE() // 10, 20
  barFn() // 10, "y" is not defined
}

foo()
```

我们看到，通过函数构造函数（Function constructor）创建的函数“bar”，是不能访问变量“y”的。但这并不意味着函数“barFn”没有 `[[Scope]]` 属性（否则它不能访问到变量“x”）。问题在于通过函构造函数创建的函数的 `[[Scope]]` 属性总是唯一的全局对象。考虑到这一点，如通过这种函数创建除全局之外的最上层的上下文闭包是不可能的。

## 二维作用域链查找

在作用域链中查找最重要的一点是变量对象的属性（如果有的话）须考虑其中－－源于 ECMAScript 的原型特性。如果一个属性在对象中没有直接找到，查询将在原型链中继续。即常说的二维链查找。（1）作用域链环节；（2）每个作用域链－－深入到原型链环节。如果在 Object.prototype 中定义了属性，我们能看到这种效果。

```js
function foo() {
  alert(x)
}

Object.prototype.x = 10

foo() // 10
```

活动对象没有原型，我们可以在下面的例子中看到：

```js
function foo() {
  var x = 20

  function bar() {
    alert(x)
  }

  bar()
}

Object.prototype.x = 10

foo() // 20
```

如果函数“bar”上下文的激活对象有一个原型，那么“x”将在 Object.prototype 中被解析，因为它在 AO 中不被直接解析。但在上面的第一个例子中，在标识符解析中，我们到达全局对象（在一些执行中并不全是这样），它从 Object.prototype 继承而来，响应地，“x”解析为 10。

同样的情况出现在一些版本的 SpiderMokey 的命名函数表达式（缩写为 NFE）中，在那里特定的对象存储从 Object.prototype 继承而来的函数表达式的可选名称，在 Blackberry 中的一些版本中，执行时激活对象从 Object.prototype 继承。

## 全局和 eval 上下文中的作用域链

这里不一定很有趣，但必须要提示一下。全局上下文的作用域链仅包含全局对象。代码 eval 的上下文与当前的调用上下文（calling context）拥有同样的作用域链。

```js
globalContext.Scope = [Global]

evalContext.Scope === callingContext.Scope
```

## 代码执行时对作用域链的影响

在 ECMAScript 中，在代码执行阶段有两个声明能修改作用域链。这就是 with 声明和 catch 语句。它们添加到作用域链的最前端，对象须在这些声明中出现的标识符中查找。如果发生其中的一个，作用域链简要的作如下修改：

```txt
Scope = withObject|catchObject + AO|VO + [[Scope]]
```

在这个例子中添加对象，对象是它的参数（这样，没有前缀，这个对象的属性变得可以访问）。

```js
var foo = { x: 10, y: 20 }

with (foo) {
  alert(x) // 10
  alert(y) // 20
}
```

作用域链修改成这样：

```txt
Scope = foo + AO|VO + [[Scope]]
```

我们再次看到，通过 with 语句，对象中标识符的解析添加到作用域链的最前端：

```js
var x = 10,
  y = 10

with ({ x: 20 }) {
  var x = 30,
    y = 30

  alert(x) // 30
  alert(y) // 30
}

alert(x) // 10
alert(y) // 30
```

在进入上下文时发生了什么？标识符“x”和“y”已被添加到变量对象中。此外，在代码运行阶段作如下修改：

1. x = 10, y = 10;
2. 对象 {x:20} 添加到作用域的前端;
3. 在 with 内部，遇到了 var 声明，当然什么也没创建，因为在进入上下文时，所有变量已被解析添加;
4. 在第二步中，仅修改变量“x”，实际上对象中的“x”现在被解析，并添加到作用域链的最前端，“x”为 20，变为 30;
5. 同样也有变量对象“y”的修改，被解析后其值也相应的由 10 变为 30;
6. 此外，在 with 声明完成后，它的特定对象从作用域链中移除（已改变的变量“x”－－30 也从那个对象中移除），即作用域链的结构恢复到 with 得到加强以前的状态。
7. 在最后两个 alert 中，当前变量对象的“x”保持同一，“y”的值现在等于 30，在 with 声明运行中已发生改变。

同样，catch 语句的异常参数变得可以访问，它创建了只有一个属性的新对象－－异常参数名。图示看起来像这样：

```js
try {
  // ...
} catch (ex) {
  alert(ex)
}
```

作用域链修改为：

```txt
var catchObject = {
  ex: <exception object>
};

Scope = catchObject + var catchObject = {
  ex: <exception object>
};

Scope = catchObject + AO|VO + [[Scope]] + [[Scope]]
```

在 catch 语句完成运行之后，作用域链恢复到以前的状态。

## 结论

在这个阶段，我们几乎考虑了与执行上下文相关的所有常用概念，以及与它们相关的细节。按照计划－－函数对象的详细分析：函数类型（函数声明，函数表达式）和闭包。顺便说一下，在这篇文章中，闭包直接与 `[[Scope]]` 属性相关，但是，关于它将在合适的篇章中讨论。
