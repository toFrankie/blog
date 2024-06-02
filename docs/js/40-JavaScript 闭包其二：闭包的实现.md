# JavaScript 闭包其二：闭包的实现

> [原文](https://web.archive.org/web/20190729211612/http://www.nowamagic.net/librarys/veda/detail/1708)

讨论完理论部分，接下来让我们来介绍下 ECMAScript 中闭包究竟是如何实现的。这里还是有必要再次强调下：ECMAScript 只使用静态（词法）作用域（而诸如 Perl 这样的语言，既可以使用静态作用域也可以使用动态作用域进行变量声明）。

```js
var x = 10

function foo() {
  alert(x)
}

;(function (funArg) {
  var x = 20

  // 变量"x"在(lexical)上下文中静态保存的，在该函数创建的时候就保存了
  funArg() // 10, 而不是20
})(foo)
```

技术上说，创建该函数的父级上下文的数据是保存在函数的内部属性 `[[Scope]]` 中的。如果你还不了解什么是 `[[Scope]]` ，建议你先阅读前面的章节，该章节对 `[[Scope]]` 作了非常详细的介绍。如果你对 `[[Scope]]` 和作用域链的知识完全理解了的话，那对闭包也就完全理解了。

根据函数创建的算法，我们看到在 ECMAScript 中，所有的函数都是闭包，因为它们都是在创建的时候就保存了上层上下文的作用域链（除开异常的情况） （不管这个函数后续是否会激活 —— `[[Scope]]` 在函数创建的时候就有了）：

```js
var x = 10;

function foo() {
  alert(x);
}

// foo是闭包
foo: <FunctionObject> = {
  [[Call]]: <code block of foo>,
  [[Scope]]: [
    global: {
      x: 10
    }
  ],
  ... // 其它属性
};
```

如我们所说，为了优化目的，当一个函数没有使用自由变量的话，实现可能不保存在副作用域链里。不过，在 ECMA-262-3 规范里任何都没说。因此，正常来说，所有的参数都是在创建阶段保存在 `[[Scope]]` 属性里的。

有些实现中，允许对闭包作用域直接进行访问。比如 Rhino，针对函数的 `[[Scope]]` 属性，对应有一个非标准的 `__parent__` 属性：

```js
var global = this
var x = 10

var foo = (function () {
  var y = 20

  return function () {
    alert(y)
  }
})()

foo() // 20
alert(foo.__parent__.y) // 20

foo.__parent__.y = 30
foo() // 30

// 可以通过作用域链移动到顶部
alert(foo.__parent__.__parent__ === global) // true
alert(foo.__parent__.__parent__.x) // 10
```

## 所有对象都引用一个 `[[Scope]]`

这里还要注意的是：在 ECMAScript 中，同一个父上下文中创建的闭包是共用一个 `[[Scope]]` 属性的。也就是说，某个闭包对其中 `[[Scope]]` 的变量做修改会影响到其他闭包对其变量的读取：

```js
var firstClosure
var secondClosure

function foo() {
  var x = 1

  firstClosure = function () {
    return ++x
  }
  secondClosure = function () {
    return --x
  }

  x = 2 // 影响 AO["x"], 在2个闭包公有的 [[Scope]] 中

  alert(firstClosure()) // 3, 通过第一个闭包的 [[Scope]]
}

foo()

alert(firstClosure()) // 4
alert(secondClosure()) // 3
```

> 这就是说：所有的内部函数都共享同一个父作用域

关于这个功能有一个非常普遍的错误认识，开发人员在循环语句里创建函数（内部进行计数）的时候经常得不到预期的结果，而期望是每个函数都有自己的值。

```js
var data = []

for (var k = 0; k < 3; k++) {
  data[k] = function () {
    alert(k)
  }
}

data[0]() // 3, 而不是0
data[1]() // 3, 而不是1
data[2]() // 3, 而不是2
```

上述例子就证明了 —— 同一个上下文中创建的闭包是共用一个 `[[Scope]]` 属性的。因此上层上下文中的变量“k”是可以很容易就被改变的。

```js
activeContext.Scope = [
  ... // 其它变量对象
  {data: [...], k: 3} // 活动对象
];

data[0].[[Scope]] === Scope;
data[1].[[Scope]] === Scope;
data[2].[[Scope]] === Scope;
```

这样一来，在函数激活的时候，最终使用到的 k 就已经变成了 3 了。如下所示，创建一个闭包就可以解决这个问题了：

```js
var data = []

for (var k = 0; k < 3; k++) {
  data[k] = (function _helper(x) {
    return function () {
      alert(x)
    }
  })(k) // 传入"k"值
}

// 现在结果是正确的了
data[0]() // 0
data[1]() // 1
data[2]() // 2
```

让我们来看看上述代码都发生了什么？函数“\_helper”创建出来之后，通过传入参数“k”激活。其返回值也是个函数，该函数保存在对应的数组元素中。这种技术产生了如下效果： 在函数激活时，每次“\_helper”都会创建一个新的变量对象，其中含有参数“x”，“x”的值就是传递进来的“k”的值。这样一来，返回的函数的 `[[Scope]]` 就成了如下所示：

```js
data[0].[[Scope]] === [
  ... // 其它变量对象
  父级上下文中的活动对象AO: {data: [...], k: 3},
  _helper上下文中的活动对象AO: {x: 0}
];

data[1].[[Scope]] === [
  ... // 其它变量对象
  父级上下文中的活动对象AO: {data: [...], k: 3},
  _helper上下文中的活动对象AO: {x: 1}
];

data[2].[[Scope]] === [
  ... // 其它变量对象
  父级上下文中的活动对象AO: {data: [...], k: 3},
  _helper上下文中的活动对象AO: {x: 2}
];
```

我们看到，这时函数的 `[[Scope]]` 属性就有了真正想要的值了，为了达到这样的目的，我们不得不在 `[[Scope]]` 中创建额外的变量对象。要注意的是，在返回的函数中，如果要获取“k”的值，那么该值还是会是 3。

顺便提下，大量介绍 JavaScript 的文章都认为只有额外创建的函数才是闭包，这种说法是错误的。实践得出，这种方式是最有效的，然而，从理论角度来说，在 ECMAScript 中所有的函数都是闭包。

然而，上述提到的方法并不是唯一的方法。通过其他方式也可以获得正确的“k”的值，如下所示：

```js
var data = []

for (var k = 0; k < 3; k++) {
  ;(data[k] = function () {
    alert(arguments.callee.x)
  }).x = k // 将k作为函数的一个属性
}

// 结果也是对的
data[0]() // 0
data[1]() // 1
data[2]() // 2
```

## Funarg 和 return

另外一个特性是从闭包中返回。在 ECMAScript 中，闭包中的返回语句会将控制流返回给调用上下文（调用者）。而在其他语言中，比如，Ruby，有很多中形式的闭包，相应的处理闭包返回也都不同，下面几种方式都是可能的：可能直接返回给调用者，或者在某些情况下——直接从上下文退出。

ECMAScript 标准的退出行为如下：

```js
function getElement() {
  ;[1, 2, 3].forEach(function (element) {
    if (element % 2 == 0) {
      // 返回给函数"forEach"函数
      // 而不是返回给getElement函数
      alert('found: ' + element) // found: 2
      return element
    }
  })

  return null
}
```

然而，在 ECMAScript 中通过 try catch 可以实现如下效果：

```js
var $break = {}

function getElement() {
  try {
    ;[1, 2, 3].forEach(function (element) {
      if (element % 2 == 0) {
        // // 从getElement中"返回"
        alert('found: ' + element) // found: 2
        $break.data = element
        throw $break
      }
    })
  } catch (e) {
    if (e == $break) {
      return $break.data
    }
  }

  return null
}

alert(getElement()) // 2
```

## 理论版本

这里说明一下，开发人员经常错误将闭包简化理解成从父上下文中返回内部函数，甚至理解成只有匿名函数才能是闭包。

> 再说一下，因为作用域链，使得所有的函数都是闭包（与函数类型无关： 匿名函数，FE，NFE，FD 都是闭包）。

这里只有一类函数除外，那就是通过 Function 构造器创建的函数，因为其 `[[Scope]]` 只包含全局对象。为了更好的澄清该问题，我们对 ECMAScript 中的闭包给出 2 个正确的版本定义：

ECMAScript 中，闭包指的是：

1. 从理论角度：所有的函数。因为它们都在创建的时候就将上层上下文的数据保存起来了。哪怕是简单的全局变量也是如此，因为函数中访问全局变量就相当于是在访问自由变量，这个时候使用最外层的作用域。
2. 从实践角度：以下函数才算是闭包：
   即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）
   在代码中引用了自由变量
