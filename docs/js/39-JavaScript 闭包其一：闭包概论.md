# JavaScript 闭包其一：闭包概论

> [原文](https://web.archive.org/web/20190729211612/http://www.nowamagic.net/librarys/veda/detail/1707)

前面介绍了作用域链和变量对象，现在再讲闭包就容易理解了。闭包其实大家都已经谈烂了。尽管如此，这里还是要试着从理论角度来讨论下闭包，看看 ECMAScript 中的闭包内部究竟是如何工作的。

在直接讨论 ECMAScript 闭包之前，还是有必要来看一下函数式编程中一些基本定义。

众所周知，在函数式语言中（ECMAScript 也支持这种风格），函数即是数据。就比方说，函数可以赋值给变量，可以当参数传递给其他函数，还可以从函数里返回等等。这类函数有特殊的名字和结构。

## 定义

> A functional argument (“Funarg”) — is an argument which value is a function.
>
> 函数式参数（“Funarg”） —— 是指值为函数的参数。

例子：

```js
function exampleFunc(funArg) {
  funArg()
}

exampleFunc(function () {
  alert('funArg')
})
```

上述例子中 funarg 的实际参数其实是传递给 exampleFunc 的匿名函数。

反过来，接受函数式参数的函数称为高阶函数（high-order function 简称：HOF）。还可以称作：函数式函数或者偏数理或操作符。上述例子中，exampleFunc 就是这样的函数。

此前提到的，函数不仅可以作为参数，还可以作为返回值。这类以函数为返回值的函数称为带函数值的函数（functions with functional value or function valued functions）。

```js
;(function functionValued() {
  return function () {
    alert('returned function is called')
  }
})()()
```

可以以正常数据形式存在的函数（比方说：当参数传递，接受函数式参数或者以函数值返回）都称作 第一类函数（一般说第一类对象）。在 ECMAScript 中，所有的函数都是第一类对象。

函数可以作为正常数据存在（例如：当参数传递，接受函数式参数或者以函数值返回）都称作第一类函数（一般说第一类对象）。

在 ECMAScript 中，所有的函数都是第一类对象。

接受自己作为参数的函数，称为自应用函数（auto-applicative function 或者 self-applicative function）：

```js
;(function selfApplicative(funArg) {
  if (funArg && funArg === selfApplicative) {
    alert('self-applicative')
    return
  }

  selfApplicative(selfApplicative)
})()
```

以自己为返回值的函数称为自复制函数（auto-replicative function 或者 self-replicative function）。通常，“自复制”这个词用在文学作品中：

```js
;(function selfReplicative() {
  return selfReplicative
})()
```

自复制函数的其中一个比较有意思的模式是让仅接受集合的一个项作为参数来接受从而代替接受集合本身。

```js
// 接受集合的函数
function registerModes(modes) {
  modes.forEach(registerMode, modes)
}

// 用法
registerModes(['roster', 'accounts', 'groups'])

// 自复制函数的声明
function modes(mode) {
  registerMode(mode) // 注册一个mode
  return modes // 返回函数自身
}

// 用法，modes链式调用
modes('roster')('accounts')('groups')

//有点类似：jQueryObject.addClass("a").toggle().removClass("b")
```

但直接传集合用起来相对来说，比较有效并且直观。

在函数式参数中定义的变量，在“funarg”激活时就能够访问了（因为存储上下文数据的变量对象每次在进入上下文的时候就创建出来了）：

```js
function testFn(funArg) {
  // funarg激活时, 局部变量localVar可以访问了
  funArg(10) // 20
  funArg(20) // 30
}

testFn(function (arg) {
  var localVar = 10
  alert(arg + localVar)
})
```

然而，在 ECMAScript 中，函数是可以封装在父函数中的，并可以使用父函数上下文的变量。这个特性会引发 funarg 问题。

## Funarg 问题

在面向堆栈的编程语言中，函数的局部变量都是保存在栈上的，每当函数激活的时候，这些变量和函数参数都会压入到该堆栈上。

当函数返回的时候，这些参数又会从栈中移除。这种模型对将函数作为函数式值使用的时候有很大的限制（比方说，作为返回值从父函数中返回）。绝大部分情况下，问题会出现在当函数有自由变量的时候。

> 自由变量是指在函数中使用的，但既不是函数参数也不是函数的局部变量的变量

例子：

```js
function testFn() {
  var localVar = 10

  function innerFn(innerParam) {
    alert(innerParam + localVar)
  }

  return innerFn
}

var someFn = testFn()
someFn(20) // 30
```

上述例子中，对于 innerFn 函数来说，localVar 就属于自由变量。

对于采用面向栈模型来存储局部变量的系统而言，就意味着当 testFn 函数调用结束后，其局部变量都会从堆栈中移除。这样一来，当从外部对 innerFn 进行函数调用的时候，就会发生错误（因为 localVar 变量已经不存在了）。

而且，上述例子在面向栈实现模型中，要想将 innerFn 以返回值返回根本是不可能的。因为它也是 testFn 函数的局部变量，也会随着 testFn 的返回而移除。

还有一个问题是当系统采用动态作用域，函数作为函数参数使用的时候有关。

看如下例子（伪代码）：

```js
var z = 10

function foo() {
  alert(z)
}

foo() // 10 – 使用静态和动态作用域的时候
;(function () {
  var z = 20
  foo() // 10 – 使用静态作用域, 20 – 使用动态作用域
})()

// 将foo作为参数的时候是一样的
;(function (funArg) {
  var z = 30
  funArg() // 10 – 静态作用域, 30 – 动态作用域
})(foo)
```

我们看到，采用动态作用域，变量（标识符）的系统是通过变量动态栈来管理的。因此，自由变量是在当前活跃的动态链中查询的，而不是在函数创建的时候保存起来的静态作用域链中查询的。

这样就会产生冲突。比方说，即使 Z 仍然存在（与之前从栈中移除变量的例子相反），还是会有这样一个问题： 在不同的函数调用中，Z 的值到底取哪个呢（从哪个上下文，哪个作用域中查询）？

上述描述的就是两类 funarg 问题 —— 取决于是否将函数以返回值返回（第一类问题）以及是否将函数当函数参数使用（第二类问题）。

为了解决上述问题，就引入了 闭包的概念。

## 闭包

> 闭包是代码块和创建该代码块的上下文中数据的结合。

让我们来看下面这个例子（伪代码）：

```js
var x = 20;

function foo() {
  alert(x); // 自由变量"x" == 20
}

// 为foo闭包
fooClosure = {
  call: foo // 引用到function
  lexicalEnvironment: {x: 20} // 搜索上下文的上下文
};
```

上述例子中，“fooClosure”部分是伪代码。对应的，在 ECMAScript 中，“foo”函数已经有了一个内部属性——创建该函数上下文的作用域链。

“lexical”通常是省略的。上述例子中是为了强调在闭包创建的同时，上下文的数据就会保存起来。当下次调用该函数的时候，自由变量就可以在保存的（闭包）上下文中找到了，正如上述代码所示，变量“z”的值总是 10。

定义中我们使用的比较广义的词 —— “代码块”，然而，通常（在 ECMAScript 中）会使用我们经常用到的函数。当然了，并不是所有对闭包的实现都会将闭包和函数绑在一起，比方说，在 Ruby 语言中，闭包就有可能是： 一个过程对象（procedure object）, 一个 lambda 表达式或者是代码块。

对于要实现将局部变量在上下文销毁后仍然保存下来，基于栈的实现显然是不适用的（因为与基于栈的结构相矛盾）。因此在这种情况下，上层作用域的闭包数据是通过 动态分配内存的方式来实现的（基于“堆”的实现），配合使用垃圾回收器（garbage collector 简称 GC）和 引用计数（reference counting）。这种实现方式比基于栈的实现性能要低，然而，任何一种实现总是可以优化的： 可以分析函数是否使用了自由变量，函数式参数或者函数式值，然后根据情况来决定 —— 是将数据存放在堆栈中还是堆中。
