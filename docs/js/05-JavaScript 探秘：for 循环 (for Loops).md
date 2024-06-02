# JavaScript 探秘：for 循环 (for Loops)

> [原文](https://web.archive.org/web/20210414195826/http://www.nowamagic.net/librarys/veda/detail/1624)

在 for 循环中，你可以循环取得数组或是数组类似对象的值，譬如 arguments 和 HTMLCollection 对象。通常的循环形式如下：

```js
// 次佳的循环
for (var i = 0; i < myarray.length; i++) {
  // 使用myarray[i]做点什么
}
```

这种形式的循环的不足在于每次循环的时候数组的长度都要去获取下。这回降低你的代码，尤其当 myarray 不是数组，而是一个 HTMLCollection 对象的时候。

HTMLCollections 指的是 DOM 方法返回的对象，例如：

```js
document.getElementsByName()
document.getElementsByClassName()
document.getElementsByTagName()
```

还有其他一些 HTMLCollections，这些是在 DOM 标准之前引进并且现在还在使用的。有：

```js
document.images: 页面上所有的图片元素
document.links : 所有a标签元素
document.forms : 所有表单
document.forms[0].elements : 页面上第一个表单中的所有域
```

集合的麻烦在于它们实时查询基本文档（HTML 页面）。这意味着每次你访问任何集合的长度，你要实时查询 DOM，而 DOM 操作一般都是比较昂贵的。

这就是为什么当你循环获取值时，缓存数组(或集合)的长度是比较好的形式，正如下面代码显示的：

```js
for (var i = 0, max = myarray.length; i < max; i++) {
  // 使用myarray[i]做点什么
}
```

这样，在这个循环过程中，你只检索了一次长度值。

在所有浏览器下，循环获取内容时缓存 HTMLCollections 的长度是更快的，2 倍(Safari3)到 190 倍(IE7)之间。//此数据貌似很老，仅供参考

注意到，当你明确想要修改循环中的集合的时候（例如，添加更多的 DOM 元素），你可能更喜欢长度更新而不是常量。

伴随着单 var 形式，你可以把变量从循环中提出来，就像下面这样：

```js
function looper() {
  var i = 0,
    max,
    myarray = []
  // ...
  for (i = 0, max = myarray.length; i < max; i++) {
    // 使用myarray[i]做点什么
  }
}
```

这种形式具有一致性的好处，因为你坚持了单一 var 形式。不足在于当重构代码的时候，复制和粘贴整个循环有点困难。例如，你从一个函数复制了一个循环到另一个函数，你不得不去确定你能够把 i 和 max 引入新的函数（如果在这里没有用的话，很有可能你要从原函数中把它们删掉）。

最后一个需要对循环进行调整的是使用下面表达式之一来替换 `i++`。

```js
i = i + 1
i += 1
```

JSLint 提示您这样做，原因是 `++` 和 `–-` 促进了“过分棘手(excessive trickiness)”。如果你直接无视它，JSLint 的 plusplus 选项会是 false（默认是 default）。

还有两种变化的形式，其又有了些微改进，因为：

- 少了一个变量(无 max)
- 向下数到 0，通常更快，因为和 0 做比较要比和数组长度或是其他不是 0 的东西作比较更有效率

```js
//第一种变化的形式：

var i, myarray = [];
for (i = myarray.length; i–-;) {
   // 使用myarray[i]做点什么
}

//第二种使用while循环：

var myarray = [],
    i = myarray.length;
while (i–-) {
   // 使用myarray[i]做点什么
}
```

这些小的改进只体现在性能上，此外 JSLint 会对使用 `i–-` 加以抱怨。
