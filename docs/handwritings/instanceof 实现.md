# 手写 instanceof

开始之前，先了解一些基本背景...

## 一、前言

我们知道，在 ECMAScript 标准中，当前数据类型分为两类（共 8 种）：

> - **原始类型**（Primitives）： 包含 Undefined、Null、Boolean、String、Number、Symbol、BigInt 共 7 种基本数据类型。
> - **引用类型**（Objects）：除原始类型之外，其余均属于引用类型，归为一大类，比如 `Object`、`Array`、`Map` 等内置方法及其实例对象。

**其中，原始值都是不可改变的，且不含任何属性或方法**。平时看到类似的 `'string'.length` 写法，本质上是发生了隐式类型转换，先将 `'string'` 转换为 `Object('string')`，然后调用 `String` 实例对象的 `length` 属性罢了。

下面，我们将「引用类型」划分为两类：

> **函数对象**（function object）：一个具有 `[[Call]]` 内部方法（[详见](https://262.ecma-international.org/#table-additional-essential-internal-methods-of-function-objects)）的对象，简单来说，就是可以通过 `()` 调用的对象，比如内置的 `Object`、`Function`、`Array` 等方法。
> **普通对象**（ordinary object）：除函数对象，其余引用值均可称为普通对象。

注意，这里提到的对象泛指引用类型，而不是单指平常所写的 `{...}` 对象。请记住：

> **所有 `Function` 的实例都是函数对象，而其他的都是普通对象**。

前面划分对象，就是为了方便分清楚 `prototype`（原型对象）和 `__proto__` （原型）的区别：

| 对象类型 | prototype | \_\_proto\_\_ |
| -------- | --------- | ------------- |
| 普通对象 | ❌        | ✅            |
| 函数对象 | ✅        | ✅            |

换句话说：

> 所有对象都有 `__proto__` 属性，而只有函数对象才具有 `prototype` 属性。

不作过多介绍，如果对这俩兄弟不太了解的，可看文章[数据类型详解](https://www.jianshu.com/p/ddc45fab9e55)。

## 二、instanceof

从 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/instanceof) 可知，其语法非常简单：

```js
object instanceof constructor
```

用于检测 `constructor.prototype` 是否存在于参数 `object` 的原型链上。

要自实现 `instanceof`，就要了解这些特性：

> - `object` 必须是引用值，否则将会返回 `false`。
> - `constructor` 必须是函数对象，否则会抛出 TypeError。

需要注意的是：不同上下文（比如网页中多个 `<iframe>`）之间拥有不同的全局对象，可理解为不同的引用地址，因此会出现如下情况：

```js
const iframe = document.createElement('iframe')
document.body.appendChild(iframe)

const xArray = window.frames[window.frames.length - 1].Array
const xarr = new xArray()
const arr = new Array()

console.log(xarr instanceof Array) // false
console.log(xarr.constructor === Array) // false

console.log(arr instanceof Array) // true
console.log(arr.constructor === Array) // true
```

因此，使用 `instanceof` 来判断是否为数组是不准确的，可看[文章](https://www.jianshu.com/p/1dc2af3b56c3)。

## 三、实现

获取原型对象的方法：

```js
// 构造函数访问 prototype 属性
constructor.prototype

// 实例对象访问 __proto__ 属性
instance.__proto__
// __proto__ 非 ECMAScript 标准，只是被所有浏览器支持罢了
// 可使用标准中的 Object.getPrototypeOf() 方法替换
```

实现如下：

```js
function myInstanceof(inst, ctor) {
  // 是否为函数对象
  const isCallable = val => typeof val === 'function'

  // 是否为引用值
  const isObject = val => typeof val === 'function' || (val !== null && typeof val === 'object')

  // ctor 必须是引用值
  if (!isObject(ctor)) throw new TypeError(`Right-hand side of 'instanceof' is not an object`)

  // ctor 必须是函数对象
  if (!isCallable(ctor)) throw new TypeError(`Right-hand side of 'instanceof' is not callable`)

  // inst 为原始值，则返回 false
  if (!isObject(inst)) return false

  do {
    const proto = inst.__proto__ // 可换成标准方法 const proto = Object.getPrototypeOf(inst)
    // 原型链顶端（proto 为 null）或者 inst 通过 Object.create(null) 构造（proto 为 undefined）
    if (proto == null) return false
    if (proto === ctor.prototype) return true
    inst = proto // 往上一级查找
  } while (true)
}
```

The end.
