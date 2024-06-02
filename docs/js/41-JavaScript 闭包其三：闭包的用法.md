# JavaScript 闭包其三：闭包的用法

> [原文](https://web.archive.org/web/20190729211612/http://www.nowamagic.net/librarys/veda/detail/1709)

实际使用的时候，闭包可以创建出非常优雅的设计，允许对 funarg 上定义的多种计算方式进行定制。如下就是数组排序的例子，它接受一个排序条件函数作为参数：

```js
;[1, 2, 3].sort(function (a, b) {
  // ... // 排序条件
})
```

同样的例子还有，数组的 map 方法是根据函数中定义的条件将原数组映射到一个新的数组中：

```js
;[1, 2, 3].map(function (element) {
  return element * 2
}) // [2, 4, 6]
```

使用函数式参数，可以很方便的实现一个搜索方法，并且可以支持无限制的搜索条件：

```js
someCollection.find(function (element) {
  return element.someProperty == 'searchCondition'
})
```

还有应用函数，比如常见的 forEach 方法，将函数应用到每个数组元素：

```js
;[1, 2, 3].forEach(function (element) {
  if (element % 2 != 0) {
    alert(element)
  }
}) // 1, 3
```

顺便提下，函数对象的 apply 和 call 方法，在函数式编程中也可以用作应用函数。 这里，我们将它们看作是应用函数 —— 应用到参数中的函数（在 apply 中是参数列表，在 call 中是独立的参数）：

```js
;(function () {
  alert([].join.call(arguments, ';')) // 1;2;3
}).apply(this, [1, 2, 3])
```

闭包还有另外一个非常重要的应用 —— 延迟调用：

```js
var a = 10
setTimeout(function () {
  alert(a) // 10, after one second
}, 1000)
```

还有回调函数：

```js
//...
var x = 10
// only for example
xmlHttpRequestObject.onreadystatechange = function () {
  // 当数据就绪的时候，才会调用;
  // 这里，不论是在哪个上下文中创建
  // 此时变量“x”的值已经存在了
  alert(x) // 10
}
//...
```

还可以创建封装的作用域来隐藏辅助对象：

```js
var foo = {}

// 初始化
;(function (object) {
  var x = 10

  object.getX = function _getX() {
    return x
  }
})(foo)

alert(foo.getX()) // 获得闭包 "x" – 10
```

## 总结

本文介绍了更多关于 ECMAScript-262-3 的理论知识，而我认为，这些基础的理论有助于理解 ECMAScript 中闭包的概念。
