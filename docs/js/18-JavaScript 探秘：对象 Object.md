# JavaScript 探秘：对象 Object

> [原文](https://web.archive.org/web/20210414202606/http://www.nowamagic.net/librarys/veda/detail/1640)

ECMAScript 是一门高度抽象的面向对象 (object-oriented) 语言，用以处理 Objects 对象。当然，也有基本类型，但是必要时，也需要转换成 object 对象来用。

> An object is a collection of properties and has a single prototype object. The prototype may be either an object or the null value.
>
> Object 是一个属性的集合，并且都拥有一个单独的原型对象 [prototype object] . 这个原型对象[prototype object] 可以是一个 object 或者 null 值。

让我们来举一个基本 Object 的例子，首先我们要清楚，一个 Object 的 prototype 是一个内部的 `[[prototype]]` 属性的引用。

不过一般来说，我们会使用 `__<内部属性名>__` 下划线来代替双括号，例如 `__proto__` (这是某些脚本引擎比如 SpiderMonkey 的对于原型概念的具体实现，尽管并非标准)。

```js
var foo = {
  x: 10,
  y: 20,
}
```

上述代码 foo 对象有两个显式的属性[explicit own properties]和一个自带隐式的 `__proto__` 属性 `[implicit __proto__ property]`，指向 foo 的原型。

![一个含有原型的基本对象](./images/2012_03_21_01.png)

为什么需要原型呢，让我们考虑原型链的概念来回答这个问题。
