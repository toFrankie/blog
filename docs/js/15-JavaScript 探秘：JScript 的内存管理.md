# JavaScript 探秘：JScript 的内存管理

> [原文](https://web.archive.org/web/20210414193527/http://www.nowamagic.net/librarys/veda/detail/1637)

知道了这些不符合规范的代码解析 bug 以后，我们如果用它的话，就会发现内存方面其实是有问题的，来看一个例子：

```js
var f = (function () {
  if (true) {
    return function g() {}
  }
  return function g() {}
})()
```

我们知道，这个匿名函数调用返回的函数（带有标识符 g 的函数），然后赋值给了外部的 f。我们也知道，命名函数表达式会导致产生多余的函数对象，而该对象与返回的函数对象不是一回事。所以这个多余的 g 函数就死在了返回函数的闭包中了，因此内存问题就出现了。这是因为 if 语句内部的函数与 g 是在同一个作用域中被声明的。这种情况下 ，除非我们显式断开对 g 函数的引用，否则它一直占着内存不放。

```js
var f = (function () {
  var f, g
  if (true) {
    f = function g() {}
  } else {
    f = function g() {}
  }
  // 设置g为null以后它就不会再占内存了
  g = null
  return f
})()
```

通过设置 g 为 null，垃圾回收器就把 g 引用的那个隐式函数给回收掉了，为了验证我们的代码，我们来做一些测试，以确保我们的内存被回收了。

## 测试

测试很简单，就是命名函数表达式创建 10000 个函数，然后把它们保存在一个数组中。等一会儿以后再看这些函数到底占用了多少内存。然后，再断开这些引用并重复这一过程。下面是测试代码：

```js
function createFn() {
  return (function () {
    var f
    if (true) {
      f = function F() {
        return 'standard'
      }
    } else if (false) {
      f = function F() {
        return 'alternative'
      }
    } else {
      f = function F() {
        return 'fallback'
      }
    }
    // var F = null;
    return f
  })()
}

var arr = []
for (var i = 0; i < 10000; i++) {
  arr[i] = createFn()
}
```

通过运行在 Windows XP SP2 中的任务管理器可以看到如下结果：

```txt
IE6:

  without `null`:   7.6K -> 20.3K
  with `null`:      7.6K -> 18K

IE7:

  without `null`:   14K -> 29.7K
  with `null`:      14K -> 27K
```

如我们所料，显示断开引用可以释放内存，但是释放的内存不是很多，10000 个函数对象才释放大约 3M 的内存，这对一些小型脚本不算什么，但对于大型程序，或者长时间运行在低内存的设备里的时候，这是非常有必要的。

关于在 Safari 2.x 中 JS 的解析也有一些 bug，但介于版本比较低，所以我们在这里就不介绍了，大家如果想看的话，请仔细查看英文资料。
