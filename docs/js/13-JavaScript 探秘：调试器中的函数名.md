# JavaScript 探秘：调试器中的函数名

> [原文](https://web.archive.org/web/20210423081249/http://www.nowamagic.net/librarys/veda/detail/1635)

如果一个函数有名字，那调试器在调试的时候会将它的名字显示在调用的栈上。有些调试器（Firebug）有时候还会为你们函数取名并显示，让他们和那些应用该函数的便利具有相同的角色，可是通常情况下，这些调试器只安装简单的规则来取名，所以说没有太大价值，我们来看一个例子：

```js
function foo() {
  return bar()
}
function bar() {
  return baz()
}
function baz() {
  debugger
}
foo()

// 这里我们使用了3个带名字的函数声明
// 所以当调试器走到debugger语句的时候，Firebug的调用栈上看起来非常清晰明了
// 因为很明白地显示了名称
baz
bar
foo
expr_test.html()
```

通过查看调用栈的信息，我们可以很明了地知道 foo 调用了 bar, bar 又调用了 baz（而 foo 本身有在 expr_test.html 文档的全局作用域内被调用），不过，还有一个比较爽地方，就是刚才说的 Firebug 为匿名表达式取名的功能：

```js
function foo() {
  return bar()
}
var bar = function () {
  return baz()
}
function baz() {
  debugger
}
foo()

// Call stack
baz
bar() //看到了么？
foo
expr_test.html()
```

然后，当函数表达式稍微复杂一些的时候，调试器就不那么聪明了，我们只能在调用栈中看到问号：

```js
function foo() {
  return bar()
}
var bar = (function () {
  if (window.addEventListener) {
    return function () {
      return baz()
    }
  } else if (window.attachEvent) {
    return function () {
      return baz()
    }
  }
})()
function baz() {
  debugger
}
foo()

// Call stack
baz(?)() // 这里可是问号哦
foo
expr_test.html()
```

另外，当把函数赋值给多个变量的时候，也会出现令人郁闷的问题：

```js
function foo() {
  return baz()
}
var bar = function () {
  debugger
}
var baz = bar
bar = function () {
  alert('spoofed')
}
foo()

// Call stack:
bar()
foo
expr_test.html()
```

这时候，调用栈显示的是 foo 调用了 bar，但实际上并非如此，之所以有这种问题，是因为 baz 和另外一个包含 alert('spoofed')的函数做了引用交换所导致的。

归根结底，只有给函数表达式取个名字，才是最委托的办法，也就是使用命名函数表达式。我们来使用带名字的表达式来重写上面的例子（注意立即调用的表达式块里返回的 2 个函数的名字都是 bar）：

```js
function foo() {
  return bar()
}
var bar = (function () {
  if (window.addEventListener) {
    return function bar() {
      return baz()
    }
  } else if (window.attachEvent) {
    return function bar() {
      return baz()
    }
  }
})()
function baz() {
  debugger
}
foo()

// 又再次看到了清晰的调用栈信息了耶!
baz
bar
foo
expr_test.html()
```

OK，又学了一招吧？
