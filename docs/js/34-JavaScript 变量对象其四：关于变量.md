# JavaScript 变量对象其四：关于变量

> [原文](https://web.archive.org/web/20210423083804/http://www.nowamagic.net/librarys/veda/detail/1673)

通常，各类文章和 JavaScript 相关的书籍都声称：“不管是使用 var 关键字(在全局上下文)还是不使用 var 关键字(在任何地方)，都可以声明一个变量”。请记住，这是错误的概念：

任何时候，变量只能通过使用 var 关键字才能声明。

上面的赋值语句：

```js
a = 10
```

这仅仅是给全局对象创建了一个新属性(但它不是变量)。“不是变量”并不是说它不能被改变，而是指它不符合 ECMAScript 规范中的变量概念，所以它“不是变量”(它之所以能成为全局对象的属性，完全是因为 VO(globalContext) === global，大家还记得这个吧？)。

让我们通过下面的实例看看具体的区别吧：

```js
alert(a) // undefined
alert(b) // "b" 没有声明

b = 10
var a = 20
```

所有根源仍然是 VO 和进入上下文阶段和代码执行阶段。

进入上下文阶段：

```js
VO = {
  a: undefined,
}
```

我们可以看到，因为“b”不是一个变量，所以在这个阶段根本就没有“b”，“b”将只在代码执行阶段才会出现(但是在我们这个例子里，还没有到那就已经出错了)。

让我们改变一下例子代码：

```js
alert(a) // undefined, 这个大家都知道，

b = 10
alert(b) // 10, 代码执行阶段创建

var a = 20
alert(a) // 20, 代码执行阶段修改
```

关于变量，还有一个重要的知识点。变量相对于简单属性来说，变量有一个特性(attribute)：{DontDelete}，这个特性的含义就是不能用 delete 操作符直接删除变量属性。

```js
a = 10
alert(window.a) // 10
alert(delete a) // true
alert(window.a) // undefined

var b = 20
alert(window.b) // 20
alert(delete b) // false
alert(window.b) // still 20
```

但是这个规则在有个上下文里不起走样，那就是 eval 上下文，变量没有 {DontDelete} 特性。

```js
eval('var a = 10;')
alert(window.a) // 10
alert(delete a) // true
alert(window.a) // undefined
```

使用一些调试工具(例如：Firebug)的控制台测试该实例时，请注意，Firebug 同样是使用 eval 来执行控制台里你的代码。因此，变量属性同样没有 {DontDelete} 特性，可以被删除。
