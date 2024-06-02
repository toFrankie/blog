# 执行上下文其四：This 指针

> [原文](https://web.archive.org/web/20210423075834/http://www.nowamagic.net/librarys/veda/detail/1647)

下面讨论一个执行上下文的最后一个属性——this 指针的概念。

## This 指针

> A this value is a special object which is related with the execution context. Therefore, it may be named as a context object (i.e. an object in which context the execution context is activated).
>
> this 适合执行的上下文环境息息相关的一个特殊对象。因此，它也可以称为上下文对象[context object](激活执行上下文的上下文)。

任何对象都可以作为上下文的 this 值。我想再次澄清对与 ECMAScript 中，与执行上下文相关的一些描述——特别是 this 的误解。通常，this 被错误地，描述为变量对象的属性。 请牢记：

> a this value is a property of the execution context, but not a property of the variable object.
>
> this 是执行上下文环境的一个属性，而不是某个变量对象的属性

这个特点很重要，因为和变量不同，this 是没有一个类似搜寻变量的过程。当你在代码中使用了 this,这个 this 的值就直接从执行的上下文中获取了，而不会从作用域链中搜寻。this 的值只取决中进入上下文时的情况。

顺便说一句，和 ECMAScript 不同，Python 有一个 self 的参数，和 this 的情况差不多，但是可以在执行过程中被改变。在 ECMAScript 中，是不可以给 this 赋值的，因为，还是那句话，this 不是变量。

在 global context(全局上下文)中，this 的值就是指全局这个对象，这就意味着，this 值就是这个变量本身。

```js
var x = 10

console.log(
  x, // 10
  this.x, // 10
  window.x // 10
)
```

在函数上下文[function context]中，this 会可能会根据每次的函数调用而成为不同的值.this 会由每一次 caller 提供,caller 是通过调用表达式[call expression]产生的（也就是这个函数如何被激活调用的）。例如，下面的例子中 foo 就是一个 callee，在全局上下文中被激活。下面的例子就表明了不同的 caller 引起 this 的不同。

```js
// "foo"函数里的alert没有改变
// 但每次激活调用的时候this是不同的

function foo() {
  alert(this)
}

// caller 激活 "foo"这个callee，
// 并且提供"this"给这个 callee

foo() // 全局对象
foo.prototype.constructor() // foo.prototype

var bar = {
  baz: foo,
}

bar.baz() // bar

bar.baz() // also bar
;(bar.baz = bar.baz)() // 这是一个全局对象
;(bar.baz, bar.baz)() // 也是全局对象
;(false || bar.baz)() // 也是全局对象

var otherFoo = bar.baz
otherFoo() // 还是全局对象
```

如果要深入思考每一次函数调用中，this 值的变化(更重要的是怎样变化)，你可以阅读本系列教程第 10 章 This。上文所提及的情况都会在此章内详细讨论。

## 总结 (Conclusion)

在此我们完成了一个简短的概述。尽管看来不是那么简短，但是这些话题若要完整表述完毕，则需要一整本书。.我们没有提及两个重要话题：函数(functions) (以及不同类型的函数之间的不同，比如函数声明与函数表达式)与 ECMAScript 的 求值策略(evaluation strategy) 。这两个话题以后会提到。

祝大家学习 ECMAScript 顺利。
