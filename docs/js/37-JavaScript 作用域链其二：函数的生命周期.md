# JavaScript 作用域链其二：函数的生命周期

> [原文](https://web.archive.org/web/20190729211029/http://www.nowamagic.net/librarys/veda/detail/1676)

函数的的生命周期分为创建和激活阶段（调用时），让我们详细研究它。

## 函数创建

众所周知，在进入上下文时函数声明放到变量/活动（VO/AO）对象中。让我们看看在全局上下文中的变量和函数声明（这里变量对象是全局对象自身，我们还记得，是吧？）

```js
var x = 10

function foo() {
  var y = 20
  alert(x + y)
}

foo() // 30
```

在函数激活时，我们得到正确的（预期的）结果－－30。但是，有一个很重要的特点。

此前，我们仅仅谈到有关当前上下文的变量对象。这里，我们看到变量“y”在函数“foo”中定义（意味着它在 foo 上下文的 AO 中），但是变量“x”并未在“foo”上下文中定义，相应地，它也不会添加到“foo”的 AO 中。乍一看，变量“x”相对于函数“foo”根本就不存在；但正如我们在下面看到的——也仅仅是“一瞥”，我们发现，“foo”上下文的活动对象中仅包含一个属性－－“y”。

```js
fooContext.AO = {
  y: undefined, // undefined – 进入上下文的时候是20 – at activation
}
```

函数“foo”如何访问到变量“x”？理论上函数应该能访问一个更高一层上下文的变量对象。实际上它正是这样，这种机制是通过函数内部的 `[[Scope]]` 属性来实现的。

`[[Scope]]` 是所有父变量对象的层级链，处于当前函数上下文之上，在函数创建时存于其中。

注意这重要的一点－－ `[[Scope]]` 在函数创建时被存储－－静态（不变的），永远永远，直至函数销毁。即：函数可以永不调用，但 `[[Scope]]` 属性已经写入，并存储在函数对象中。

另外一个需要考虑的是－－与作用域链对比，`[[Scope]]` 是函数的一个属性而不是上下文。考虑到上面的例子，函数“foo”的 `[[Scope]]` 如下：

```js
foo.[[Scope]] = [
  globalContext.VO // === Global
];
```

举例来说，我们用通常的 ECMAScript 数组展现作用域和 `[[Scope]]`。

继续，我们知道在函数调用时进入上下文，这时候活动对象被创建，this 和作用域（作用域链）被确定。让我们详细考虑这一时刻。

## 函数激活

正如在定义中说到的，进入上下文创建 AO/VO 之后，上下文的 Scope 属性（变量查找的一个作用域链）作如下定义：

```txt
Scope = AO|VO + [[Scope]]
```

上面代码的意思是：活动对象是作用域数组的第一个对象，即添加到作用域的前端。

```js
Scope = [AO].concat([[Scope]])
```

这个特点对于标示符解析的处理来说很重要。标示符解析是一个处理过程，用来确定一个变量（或函数声明）属于哪个变量对象。

这个算法的返回值中，我们总有一个引用类型，它的 base 组件是相应的变量对象（或若未找到则为 null）,属性名组件是向上查找的标示符的名称。引用类型的详细信息在后面已讨论。

标识符解析过程包含与变量名对应属性的查找，即作用域中变量对象的连续查找，从最深的上下文开始，绕过作用域链直到最上层。

这样一来，在向上查找中，一个上下文中的局部变量较之于父作用域的变量拥有较高的优先级。万一两个变量有相同的名称但来自不同的作用域，那么第一个被发现的是在最深作用域中。

我们用一个稍微复杂的例子描述上面讲到的这些。

```js
var x = 10

function foo() {
  var y = 20

  function bar() {
    var z = 30
    alert(x + y + z)
  }

  bar()
}

foo() // 60
```

对此，我们有如下的变量/活动对象，函数的的 `[[Scope]]` 属性以及上下文的作用域链：

全局上下文的变量对象是：

```js
globalContext.VO === Global = {
  x: 10
  foo: <reference to function>
}
```

在“foo”创建时，“foo”的 `[[Scope]]` 属性是：

```js
foo.[[Scope]] = [
  globalContext.VO
]
```

在“foo”激活时（进入上下文），“foo”上下文的活动对象是：

```js
fooContext.AO = {
  y: 20,
  bar: <reference to function>
};
```

“foo”上下文的作用域链为：

```js
fooContext.Scope = fooContext.AO + foo.[[Scope]] // i.e.:

fooContext.Scope = [
  fooContext.AO,
  globalContext.VO
]
```

内部函数“bar”创建时，其 `[[Scope]]` 为：

```js
bar.[[Scope]] = [
  fooContext.AO,
  globalContext.VO
]
```

在“bar”激活时，“bar”上下文的活动对象为：

```js
barContext.AO = {
  z: 30,
}
```

“bar”上下文的作用域链为：

```js
barContext.Scope = barContext.AO + bar.[[Scope]] // i.e.:

barContext.Scope = [
  barContext.AO,
  fooContext.AO,
  globalContext.VO
];
```

对“x”、“y”、“z”的标识符解析如下：

```txt
- "x"
-- barContext.AO // not found
-- fooContext.AO // not found
-- globalContext.VO // found - 10

- "y"
-- barContext.AO // not found
-- fooContext.AO // found - 20

- "z"
-- barContext.AO // found - 30
```
