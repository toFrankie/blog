# JavaScript 函数其四：函数构造器

> [原文](https://web.archive.org/web/20210423081123/http://www.nowamagic.net/librarys/veda/detail/1665)

既然这种函数对象也有自己的特色，我们将它与 FD 和 FE 区分开来。其主要特点在于这种函数的 `[[Scope]]` 属性仅包含全局对象：

```js
var x = 10

function foo() {
  var x = 20
  var y = 30

  var bar = new Function('alert(x); alert(y);')
  bar() // 10, "y" 未定义
}
```

我们看到，函数 bar 的 `[[Scope]]` 属性不包含 foo 上下文的 Ao——变量”y”不能访问，变量”x”从全局对象中取得。顺便提醒一句，Function 构造器既可使用 new 关键字，也可以没有，这样说来，这些变体是等价的。

这些函数的其他特点与 Equated Grammar Productions 和 Joined Objects 相关。作为优化建议（但是，实现上可以不使用优化）,规范提供了这些机制。如，如果我们有一个 100 个元素的数组，在函数的一个循环中，执行可能使用 Joined Objects 机制。结果是数组中的所有元素仅一个函数对象可以使用。

```js
var a = []

for (var k = 0; k < 100; k++) {
  a[k] = function () {} // 可能使用了joined objects
}
```

但是通过函数构造器创建的函数不会被连接。

```js
var a = []

for (var k = 0; k < 100; k++) {
  a[k] = Function('') // 一直是100个不同的函数
}
```

另外一个与联合对象（joined objects）相关的例子：

```js
function foo() {
  function bar(z) {
    return z * z
  }

  return bar
}

var x = foo()
var y = foo()
```

这里的实现，也有权利连接对象 x 和对象 y（使用同一个对象），因为函数（包括它们的内部 `[[Scope]]` 属性）在根本上是没有区别的。因此，通过函数构造器创建的函数总是需要更多的内存资源。

## 创建函数的算法

下面的伪码描述了函数创建的算法（与联合对象相关的步骤除外）。这些描述有助于你理解 ECMAScript 中函数对象的更多细节。这种算法适合所有的函数类型。

```js
F = new NativeObject();

// 属性[[Class]]是"Function"
F.[[Class]] = "Function"

// 函数对象的原型是Function的原型
F.[[Prototype]] = Function.prototype

// 医用到函数自身
// 调用表达式F的时候激活[[Call]]
// 并且创建新的执行上下文
F.[[Call]] = < reference to function>

// 在对象的普通构造器里编译
// [[Construct]] 通过new关键字激活
// 并且给新对象分配内存
// 然后调用F.[[Call]]初始化作为this传递的新创建的对象
F.[[Construct]] = internalConstructor

// 当前执行上下文的作用域链
// 例如，创建F的上下文
F.[[Scope]] = activeContext.Scope
// 如果函数通过new Function(...)来创建，
// 那么
F.[[Scope]] = globalContext.Scope

// 传入参数的个数
F.length = countParameters

// F对象创建的原型
__objectPrototype = new Object();
__objectPrototype.constructor = F // {DontEnum}, 在循环里不可枚举x
F.prototype = __objectPrototype

return F
```

注意，`F.[[Prototype]]` 是函数（构造器）的一个原型，`F.prototype` 是通过这个函数创建的对象的原型（因为术语常常混乱，一些文章中 `F.prototype` 被称之为“构造器的原型”，这是不正确的）。
