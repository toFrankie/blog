# 手写系列 - new 关键字的实现

## 原理

先了解下 `new` 关键字都做了些什么工作：

> 1.  隐式创建一个实例对象 `this`（空对象）；
> 2.  将实例对象原型（`__proto__`）指向构造函数的原型对象（`prototype`）；
> 3.  开始执行构造函数，一般会伴随着实例对象属性、方法的绑定；
> 4.  返回结果。需要注意的是，上一步执行构造函数返回的结果，若为引用值，则直接返回该值，否则返回实例对象。

## 思路

知道原理之后，手写就有思路了，我们将会使用以下方式进行调用：

```js
myNew(ctor, arg1, arg2, ...)
```

- `ctor` 接受一个构造函数。

- `arg1, arg2, ...`（可选）指定参数列表。

## 实现

代码实现，如下：

```js
function myNew() {
  // 获取构造函数、参数列表
  const [Ctor, ...args] = arguments

  // 创建实例对象，并指定原型
  const _this = {}
  _this.__proto__ = Ctor.prototype // 或使用标准方法 Object.setPrototypeOf(_this, Ctor.prototype)

  // 执行构造函数，并注意 this 指向
  const res = Ctor.apply(_this, args)

  // 返回结果
  return res instanceof Object ? res : _this
}
```

## 优化

既然我们直接使用了 ES6 的语法，我们不妨将创建实例对象的步骤改用 `Object.create()` 来处理，再简化一下：

```js
function myNew(Ctor, ...args) {
  const _this = Object.create(Ctor.prototype)
  const res = Ctor.apply(_this, args)
  return res instanceof Object ? res : _this
}
```

## Usage

```js
function Foo(name, age) {
  this.name = name
  this.age = age
}

const foo = myNew(Foo, 'Frankie', 20) // Foo { name: 'Frankie', age: 20 }
```
