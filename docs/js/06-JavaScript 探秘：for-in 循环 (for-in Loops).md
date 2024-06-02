# JavaScript 探秘：for-in 循环 (for-in Loops)

> [原文](https://web.archive.org/web/20210414195035/http://www.nowamagic.net/librarys/veda/detail/1625)

for-in 循环应该用在非数组对象的遍历上，使用 for-in 进行循环也被称为“枚举”。

从技术上将，你可以使用 for-in 循环数组（因为 JavaScript 中数组也是对象），但这是不推荐的。因为如果数组对象已被自定义的功能增强，就可能发生逻辑错误。另外，在 for-in 中，属性列表的顺序（序列）是不能保证的。所以最好数组使用正常的 for 循环，对象使用 for-in 循环。

有个很重要的 hasOwnProperty() 方法，当遍历对象属性的时候可以过滤掉从原型链上下来的属性。

思考下面一段代码：

```js
// 对象
var man = {
  hands: 2,
  legs: 2,
  heads: 1,
}

// 在代码的某个地方
// 一个方法添加给了所有对象
if (typeof Object.prototype.clone === 'undefined') {
  Object.prototype.clone = function () {}
}
```

在这个例子中，我们有一个使用对象字面量定义的名叫 man 的对象。在 man 定义完成后的某个地方，在对象原型上增加了一个很有用的名叫 clone() 的方法。此原型链是实时的，这就意味着所有的对象自动可以访问新的方法。为了避免枚举 man 的时候出现 clone() 方法，你需要应用 hasOwnProperty() 方法过滤原型属性。如果不做过滤，会导致 clone() 函数显示出来，在大多数情况下这是不希望出现的。

```js
// 1.
// for-in 循环
for (var i in man) {
  if (man.hasOwnProperty(i)) {
    // 过滤
    console.log(i, ':', man[i])
  }
}
/* 控制台显示结果
hands : 2
legs : 2
heads : 1
*/

// 2.
// 反面例子:
// for-in loop without checking hasOwnProperty()
for (var i in man) {
  console.log(i, ':', man[i])
}
/*
控制台显示结果
hands : 2
legs : 2
heads : 1
clone: function()
*/
```

另外一种使用 hasOwnProperty() 的形式是取消 Object.prototype 上的方法。像这样：

```js
for (var i in man) {
  if (Object.prototype.hasOwnProperty.call(man, i)) {
    // 过滤
    console.log(i, ':', man[i])
  }
}
```

其好处在于在 man 对象重新定义 hasOwnProperty 情况下避免命名冲突。也避免了长属性查找对象的所有方法，你可以使用局部变量“缓存”它。

```js
var i,
  hasOwn = Object.prototype.hasOwnProperty
for (i in man) {
  if (hasOwn.call(man, i)) {
    // 过滤
    console.log(i, ':', man[i])
  }
}
```

严格来说，不使用 hasOwnProperty() 并不是一个错误。根据任务以及你对代码的自信程度，你可以跳过它以提高些许的循环速度。但是当你对当前对象内容（和其原型链）不确定的时候，添加 hasOwnProperty()更加保险些。

格式化的变化（通不过 JSLint）会直接忽略掉花括号，把 if 语句放到同一行上。其优点在于循环语句读起来就像一个完整的想法（每个元素都有一个自己的属性”X”，使用”X”干点什么）：

```js
// 警告： 通不过JSLint检测
var i,
  hasOwn = Object.prototype.hasOwnProperty
for (i in man)
  if (hasOwn.call(man, i)) {
    // 过滤
    console.log(i, ':', man[i])
  }
```
