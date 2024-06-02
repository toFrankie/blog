# 执行上下文其二：作用域链 Scope Chains

> [原文](https://web.archive.org/web/20210417022803/http://www.nowamagic.net/librarys/veda/detail/1645)

## 作用域链 (Scope Chains)

> A scope chain is a list of objects that are searched for identifiers appear in the code of the context.
>
> 作用域链是一个 对象列表(list of objects) ，用以检索上下文代码中出现的 标识符(identifiers) 。

作用域链的原理和原型链很类似，如果这个变量在自己的作用域中没有，那么它会寻找父级的，直到最顶层。

标示符 [Identifiers] 可以理解为变量名称、函数声明和普通参数。例如，当一个函数在自身函数体内需要引用一个变量，但是这个变量并没有在函数内部声明（或者也不是某个参数名），那么这个变量就可以称为自由变量[free variable]。那么我们搜寻这些自由变量就需要用到作用域链。

在一般情况下，一个作用域链包括父级变量对象（variable object）（作用域链的顶部）、函数自身变量 VO 和活动对象（activation object）。不过，有些情况下也会包含其它的对象，例如在执行期间，动态加入作用域链中的—例如 with 或者 catch 语句。[译注：with-objects 指的是 with 语句，产生的临时作用域对象；catch-clauses 指的是 catch 从句，如 catch(e)，这会产生异常对象，导致作用域变更]。

当查找标识符的时候，会从作用域链的活动对象部分开始查找，然后(如果标识符没有在活动对象中找到)查找作用域链的顶部，循环往复，就像作用域链那样。

```js
var x = 10

;(function foo() {
  var y = 20
  ;(function bar() {
    var z = 30
    // "x"和"y"是自由变量
    // 会在作用域链的下一个对象中找到（函数”bar”的互动对象之后）
    console.log(x + y + z)
  })()
})()
```

我们假设作用域链的对象联动是通过一个叫做`__parent__`的属性，它是指向作用域链的下一个对象。这可以在 Rhino Code 中测试一下这种流程，这种技术也确实在 ES5 环境中实现了(有一个称为 outer 链接).当然也可以用一个简单的数据来模拟这个模型。使用`__parent__`的概念，我们可以把上面的代码演示成如下的情况。（因此，父级变量是被存在函数的 `[[Scope]]` 属性中的）。

![作用域链](./images/2012_03_21_09.png)

在代码执行过程中，如果使用 with 或者 catch 语句就会改变作用域链。而这些对象都是一些简单对象，他们也会有原型链。这样的话，作用域链会从两个维度来搜寻。

1. 首先在原本的作用域链
2. 每一个链接点的作用域的链（如果这个链接点是有 prototype 的话）

我们再看下面这个例子：

```js
Object.prototype.x = 10

var w = 20
var y = 30

// 在SpiderMonkey全局对象里
// 例如，全局上下文的变量对象是从"Object.prototype"继承到的
// 所以我们可以得到“没有声明的全局变量”
// 因为可以从原型链中获取

console.log(x) // 10
;(function foo() {
  // "foo" 是局部变量
  var w = 40
  var x = 100

  // "x" 可以从"Object.prototype"得到，注意值是10哦
  // 因为{z: 50}是从它那里继承的

  with ({ z: 50 }) {
    console.log(w, x, y, z) // 40, 10, 30, 50
  }

  // 在"with"对象从作用域链删除之后
  // x又可以从foo的上下文中得到了，注意这次值又回到了100哦
  // "w" 也是局部变量
  console.log(x, w) // 100, 40

  // 在浏览器里
  // 我们可以通过如下语句来得到全局的w值
  console.log(window.w) // 20
})()
```

我们就会有如下结构图示。这表示，在我们去搜寻 `__parent__` 之前，首先会去 `__proto__` 的链接中。

![with 增大的作用域链](./images/2012_03_21_10.png)

注意，不是所有的全局对象都是由 Object.prototype 继承而来的。上述图示的情况可以在 SpiderMonkey 中测试。

只要所有外部函数的变量对象都存在，那么从内部函数引用外部数据则没有特别之处——我们只要遍历作用域链表，查找所需变量。然而，如上文所提及，当一个上下文终止之后，其状态与自身将会被 销毁(destroyed) ，同时内部函数将会从外部函数中返回。此外，这个返回的函数之后可能会在其他的上下文中被激活，那么如果一个之前被终止的含有一些自由变量的上下文又被激活将会怎样?通常来说，解决这个问题的概念在 ECMAScript 中与作用域链直接相关，被称为 (词法)闭包((lexical) closure)。
