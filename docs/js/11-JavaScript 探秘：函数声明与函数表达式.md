# JavaScript 探秘：函数声明与函数表达式

> [原文](https://web.archive.org/web/20210414202727/http://www.nowamagic.net/librarys/veda/detail/1630)

在 ECMAScript 中，创建函数的最常用的两个方法是函数表达式和函数声明，两者期间的区别是有点晕，因为 ECMA 规范只明确了一点：函数声明必须带有标示符（Identifier）（就是大家常说的函数名称），而函数表达式则可以省略这个标示符：

函数声明：

```js
function 函数名称 (参数：可选){ 函数体 }
```

函数表达式：

```js
function 函数名称（可选）(参数：可选){ 函数体 }
```

所以，可以看出，如果不声明函数名称，它肯定是表达式，可如果声明了函数名称的话，如何判断是函数声明还是函数表达式呢？ECMAScript 是通过上下文来区分的，如果 `function foo(){}` 是作为赋值表达式的一部分的话，那它就是一个函数表达式，如果 `function foo(){}` 被包含在一个函数体内，或者位于程序的最顶部的话，那它就是一个函数声明。

```js
function foo() {} // 声明，因为它是程序的一部分
var bar = function foo() {} // 表达式，因为它是赋值表达式的一部分

new (function bar() {})() // 表达式，因为它是new表达式
;(function () {
  function bar() {} // 声明，因为它是函数体的一部分
})()
```

还有一种函数表达式不太常见，就是被括号括住的 `(function foo(){})`，他是表达式的原因是因为括号 `()` 是一个分组操作符，它的内部只能包含表达式，我们来看几个例子：

```js
function foo(){} // 函数声明
(function foo(){}); // 函数表达式：包含在分组操作符内

try {
	(var x = 5); // 分组操作符，只能包含表达式而不能包含语句：这里的var就是语句
} catch(err) {
	// SyntaxError
}
```

你可以会想到，在使用 `eval` 对 JSON 进行执行的时候，JSON 字符串通常被包含在一个圆括号里：`eval('(' + json + ')')`，这样做的原因就是因为分组操作符，也就是这对括号，会让解析器强制将 JSON 的花括号解析成表达式而不是代码块。

```js
try {
	{ "x": 5 }; // "{" 和 "}" 做解析成代码块
} catch(err) {
	// SyntaxError
}

({ "x": 5 }); // 分组操作符强制将"{" 和 "}"作为对象字面量来解析
```

表达式和声明存在着十分微妙的差别，首先，函数声明会在任何表达式被解析和求值之前先被解析和求值，即使你的声明在代码的最后一行，它也会在同作用域内第一个表达式之前被解析/求值，参考如下例子，函数 `fn` 是在 `alert` 之后声明的，但是在 `alert` 执行的时候，`fn` 已经有定义了：

```js
alert(fn())

function fn() {
  return 'Hello world!'
}
```

另外，还有一点需要提醒一下，函数声明在条件语句内虽然可以用，但是没有被标准化，也就是说不同的环境可能有不同的执行结果，所以这样情况下，最好使用函数表达式：

```js
// 千万别这样做！
// 因为有的浏览器会返回first的这个function，而有的浏览器返回的却是第二个

if (true) {
  function foo() {
    return 'first'
  }
} else {
  function foo() {
    return 'second'
  }
}
foo()

// 相反，这样情况，我们要用函数表达式
var foo
if (true) {
  foo = function () {
    return 'first'
  }
} else {
  foo = function () {
    return 'second'
  }
}
foo()
```

函数声明的实际规则如下：

函数声明只能出现在程序或函数体内。从句法上讲，它们 不能出现在 Block（块）（`{ ... }`）中，例如不能出现在 `if`、`while` 或 `for` 语句中。因为 Block（块） 中只能包含 Statement 语句， 而不能包含函数声明这样的源元素。另一方面，仔细看一看规则也会发现，唯一可能让表达式出现在 Block（块）中情形，就是让它作为表达式语句的一部分。但是，规范明确规定了表达式语句不能以关键字 `function` 开头。而这实际上就是说，函数表达式同样也不能出现在 Statement 语句或 Block（块）中（因为 Block（块）就是由 Statement 语句构成的）。
