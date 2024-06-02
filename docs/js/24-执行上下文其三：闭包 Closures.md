# 执行上下文其三：闭包 Closures

> [原文](https://web.archive.org/web/20210414193951/http://www.nowamagic.net/librarys/veda/detail/1646)

## 闭包(Closures)

在 ECMAScript 中，函数是“第一类”对象。这个名词意味着函数可以作为参数被传递给其他函数使用 (在这种情况下，函数被称为“funargs”——“functional arguments”的缩写[译注：这里不知翻译为泛函参数是否恰当])。接收“funargs”的函数被称之为 高阶函数(higher-order functions) ，或者更接近数学概念的话，被称为 运算符(operators) 。其他函数的运行时也会返回函数，这些返回的函数被称为 function valued 函数 (有 functional value 的函数)。

“funargs”与“functional values”有两个概念上的问题，这两个子问题被称为“Funarg problem” (“泛函参数问题”)。要准确解决泛函参数问题，需要引入 闭包(closures) 到的概念。让我们仔细描述这两个问题(我们可以见到，在 ECMAScript 中使用了函数的 `[[Scope]]` 属性来解决这个问题)。

“funarg problem”的一个子问题是“upward funarg problem”[译注：或许可以翻译为：向上查找的函数参数问题]。当一个函数从其他函数返回到外部的时候，这个问题将会出现。要能够在外部上下文结束时，进入外部上下文的变量，内部函数 在创建的时候(at creation moment) 需要将之存储进 `[[Scope]]` 属性的父元素的作用域中。然后当函数被激活时，上下文的作用域链表现为激活对象与 `[[Scope]]` 属性的组合(事实上，可以在上图见到)：

```js
Scope chain = Activation object + [[Scope]]
作用域链 = 活动对象 + [[Scope]]
```

请注意，最主要的事情是——函数在被创建时保存外部作用域，是因为这个 被保存的作用域链(saved scope chain) 将会在未来的函数调用中用于变量查找。

```js
function foo() {
  var x = 10
  return function bar() {
    console.log(x)
  }
}

// "foo"返回的也是一个function
// 并且这个返回的function可以随意使用内部的变量x

var returnedFunction = foo()

// 全局变量 "x"
var x = 20

// 支持返回的function
returnedFunction() // 结果是10而不是20
```

这种形式的作用域称为静态作用域[static/lexical scope]。上面的 x 变量就是在函数 bar 的`[[Scope]]`中搜寻到的。理论上来说，也会有动态作用域[dynamic scope], 也就是上述的 x 被解释为 20，而不是 10. 但是 EMCAScript 不使用动态作用域。

“funarg problem”的另一个类型就是自上而下[”downward funarg problem”].在这种情况下，父级的上下会存在，但是在判断一个变量值的时候会有多义性。也就是，这个变量究竟应该使用哪个作用域。是在函数创建时的作用域呢，还是在执行时的作用域呢？为了避免这种多义性，可以采用闭包，也就是使用静态作用域。

请看下面的例子：

```js
// 全局变量 "x"
var x = 10

// 全局function
function foo() {
  console.log(x)
}

;(function (funArg) {
  // 局部变量 "x"
  var x = 20

  // 这不会有歧义
  // 因为我们使用"foo"函数的[[Scope]]里保存的全局变量"x",
  // 并不是caller作用域的"x"

  funArg() // 10, 而不是20
})(foo) // 将foo作为一个"funarg"传递下去
```

从上述的情况，我们似乎可以断定，在语言中，使用静态作用域是闭包的一个强制性要求。不过，在某些语言中，会提供动态和静态作用域的结合，可以允许开发员选择哪一种作用域。但是在 ECMAScript 中，只采用了静态作用域。所以 ECMAScript 完全支持使用 `[[Scope]]` 的属性。我们可以给闭包得出如下定义：

> A closure is a combination of a code block (in ECMAScript this is a function) and statically/lexically saved all parent scopes.Thus, via these saved scopes a function may easily refer free variables.
>
> 闭包是一系列代码块（在 ECMAScript 中是函数），并且静态保存所有父级的作用域。通过这些保存的作用域来搜寻到函数中的自由变量。

请注意，因为每一个普通函数在创建时保存了 `[[Scope]]`，理论上，ECMAScript 中所有函数都是闭包。

还有一个很重要的点，几个函数可能含有相同的父级作用域（这是一个很普遍的情况，例如有好几个内部或者全局的函数）。在这种情况下，在 `[[Scope]]` 中存在的变量是会共享的。一个闭包中变量的变化，也会影响另一个闭包的。

```js
function baz() {
  var x = 1
  return {
    foo: function foo() {
      return ++x
    },
    bar: function bar() {
      return --x
    },
  }
}

var closures = baz()

console.log(
  closures.foo(), // 2
  closures.bar() // 1
)
```

上述代码可以用这张图来表示：

![共享的 [[Scope]]](./images/2012_03_21_11.png)

在某个循环中创建多个函数时，上图会引发一个困惑。如果在创建的函数中使用循环变量(如”k”)，那么所有的函数都使用同样的循环变量，导致一些程序员经常会得不到预期值。现在清楚为什么会产生如此问题了——因为所有函数共享同一个 `[[Scope]]`，其中循环变量为最后一次复赋值。

```js
var data = []

for (var k = 0; k < 3; k++) {
  data[k] = function () {
    alert(k)
  }
}

data[0]() // 3, but not 0
data[1]() // 3, but not 1
data[2]() // 3, but not 2
```

有一些用以解决这类问题的技术。其中一种技巧是在作用域链中提供一个额外的对象，比如增加一个函数：

```js
var data = []

for (var k = 0; k < 3; k++) {
  data[k] = (function (x) {
    return function () {
      alert(x)
    }
  })(k) // 将k当做参数传递进去
}

// 结果正确
data[0]() // 0
data[1]() // 1
data[2]() // 2
```
