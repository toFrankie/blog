# JavaScript 函数其二：函数表达式

> [原文](https://web.archive.org/web/20210423082555/http://www.nowamagic.net/librarys/veda/detail/1663)

另外一种可以取代函数声明的方式是函数表达式，解释如下：

## 函数表达式

函数表达式（缩写为 FE）是这样一种函数：

1. 在源码中须出现在表达式的位置
2. 有可选的名称
3. 不会影响变量对象
4. 在代码执行阶段创建

这种函数类型的主要特点在于它在源码中总是处在表达式的位置。最简单的一个例子就是一个赋值声明：

```js
var foo = function () {
  // ...
}
```

该例演示是让一个匿名函数表达式赋值给变量 foo，然后该函数可以用 foo 这个名称进行访问——foo()。

同时和定义里描述的一样，函数表达式也可以拥有可选的名称：

```js
var foo = function _foo() {
  // ...
}
```

需要注意的是，在外部 FE 通过变量“foo”来访问——foo()，而在函数内部（如递归调用），有可能使用名称“\_foo”。

如果 FE 有一个名称，就很难与 FD 区分。但是，如果你明白定义，区分起来就简单明了：FE 总是处在表达式的位置。在下面的例子中我们可以看到各种 ECMAScript 表达式：

```js
// 圆括号（分组操作符）内只能是表达式
;(function foo() {})

// 在数组初始化器内只能是表达式
;[function bar() {}]

// 逗号也只能操作表达式
1, function baz() {}
```

表达式定义里说明：FE 只能在代码执行阶段创建而且不存在于变量对象中，让我们来看一个示例行为：

```js
// FE在定义阶段之前不可用（因为它是在代码执行阶段创建）
alert(foo) // "foo" 未定义
;(function foo() {})

// 定义阶段之后也不可用，因为他不在变量对象VO中
alert(foo) // "foo" 未定义
```

相当一部分问题出现了，我们为什么需要函数表达式？答案很明显——在表达式中使用它们，”不会污染”变量对象。最简单的例子是将一个函数作为参数传递给其它函数。

```js
function foo(callback) {
  callback()
}

foo(function bar() {
  alert('foo.bar')
})

foo(function baz() {
  alert('foo.baz')
})
```

在上述例子里，FE 赋值给了一个变量（也就是参数），函数将该表达式保存在内存中，并通过变量名来访问（因为变量影响变量对象)，如下：

```js
var foo = function () {
  alert('foo')
}

foo()
```

另外一个例子是创建封装的闭包从外部上下文中隐藏辅助性数据（在下面的例子中我们使用 FE，它在创建后立即调用）：

```js
var foo = {}

;(function initialize() {
  var x = 10
  foo.bar = function () {
    alert(x)
  }
})()

foo.bar() // 10;
alert(x) // "x" 未定义
```

我们看到函数 foo.bar（通过 `[[Scope]]` 属性）访问到函数 initialize 的内部变量“x”。同时，“x”在外部不能直接访问。在许多库中，这种策略常用来创建”私有”数据和隐藏辅助实体。在这种模式中，初始化的 FE 的名称通常被忽略：

```js
;(function () {
  // 初始化作用域
})()
```

还有一个例子是：在代码执行阶段通过条件语句进行创建 FE，不会污染变量对象 VO。

```js
var foo = 10

var bar =
  foo % 2 == 0
    ? function () {
        alert(0)
      }
    : function () {
        alert(1)
      }

bar() // 0
```
