# JavaScript 探秘：原型链 Prototype chain

> [原文](https://web.archive.org/web/20210414201922/http://www.nowamagic.net/librarys/veda/detail/1641)

原型对象也是普通的对象，并且也有可能有自己的原型，如果一个原型对象的原型不为 null 的话，我们就称之为原型链（prototype chain）。

> A prototype chain is a finite chain of objects which is used to implemented inheritance and shared properties.
>
> 原型链是一个由对象组成的有限对象链由于实现继承和共享属性。

想象一个这种情况，2 个对象，大部分内容都一样，只有一小部分不一样，很明显，在一个好的设计模式中，我们会需要重用那部分相同的，而不是在每个对象中重复定义那些相同的方法或者属性。在基于类 `[class-based]` 的系统中，这些重用部分被称为类的继承 – 相同的部分放入 class A，然后 class B 和 class C 从 A 继承，并且可以声明拥有各自的独特的东西。

ECMAScript 没有类的概念。但是，重用 `[reuse]` 这个理念没什么不同（某些方面，甚至比 class-更加灵活），可以由 prototype chain 原型链来实现。这种继承被称为 delegation based inheritance-基于继承的委托，或者更通俗一些，叫做原型继承。

类似于类”A”，”B”，”C”，在 ECMAScript 中尼创建对象类”a”，”b”，”c”，相应地， 对象“a” 拥有对象“b”和”c”的共同部分。同时对象“b”和”c”只包含它们自己的附加属性或方法。

```js
var a = {
  x: 10,
  calculate: function (z) {
    return this.x + this.y + z
  },
}

var b = {
  y: 20,
  __proto__: a,
}

var c = {
  y: 30,
  __proto__: a,
}

// 调用继承过来的方法
b.calculate(30) // 60
c.calculate(40) // 80
```

这样看上去是不是很简单啦。b 和 c 可以使用 a 中定义的 calculate 方法，这就是有原型链来 `[prototype chain]` 实现的。

原理很简单:如果在对象 b 中找不到 calculate 方法(也就是对象 b 中没有这个 calculate 属性), 那么就会沿着原型链开始找。如果这个 calculate 方法在 b 的 prototype 中没有找到，那么就会沿着原型链找到 a 的 prototype，一直遍历完整个原型链。记住，一旦找到，就返回第一个找到的属性或者方法。因此，第一个找到的属性成为继承属性。如果遍历完整个原型链，仍然没有找到，那么就会返回 undefined。

注意一点，this 这个值在一个继承机制中，仍然是指向它原本属于的对象，而不是从原型链上找到它时，它所属于的对象。例如，以上的例子，this.y 是从 b 和 c 中获取的，而不是 a。当然，你也发现了 this.x 是从 a 取的，因为是通过原型链机制找到的。

如果一个对象的 prototype 没有显示的声明过或定义过，那么 `__prototype__` 的默认值就是 `Object.prototype`, 而 `Object.prototype` 也会有一个 `__prototype__`, 这个就是原型链的终点了，被设置为 null。

下面的图示就是表示了上述 a,b,c 的继承关系：

![原型链](./images/2012_03_21_02.png)

原型链通常将会在这样的情况下使用：对象拥有 相同或相似的状态结构(same or similar state structure) （即相同的属性集合）与 不同的状态值(different state values)。在这种情况下，我们可以使用 构造函数(Constructor) 在 特定模式(specified pattern) 下创建对象。
