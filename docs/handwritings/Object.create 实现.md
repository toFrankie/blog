# 手写实现 Object.create() 方法

`Object.create(proto, propertiesObject)` 方法会创建一个带着指定原型对象和属性的「新对象」。

实现起来很简单，主要注意参数的边界值即可：

- **`proto`** - 仅接受原始值 `null` 或任意引用值，否则抛出 `TypeError`。
- **`propertiesObject`** - 可选参数，与 `Object.defineProperties()` 第二参数相同。若 `propertiesObject` 不为 `undefined` 时，该参数「本身可枚举属性」（不包括原型链上的枚举属性）将会作为新创建对象属性值和对应的属性描述符。

实现如下：

```js
Object.prototype.myCreate = function (proto, propertiesObject) {
  // 只允许 null 或引用值
  if (typeof proto !== 'object') {
    throw new TypeError('Object prototype may only be an Object or null: ' + proto)
  }

  // 直接使用字面量，无需构造函数
  var _obj = {}
  _obj.__proto__ = proto // 相当于 ES6 中的 Object.setPrototypeOf(_obj, proto)

  if (propertiesObject !== undefined) {
    Object.defineProperties(_obj, propertiesObject)
  }

  return _obj
}
```

如果你对里面 `if (propertiesObject !== undefined) {}` 存疑，不妨亲自试下这些用例：

```js
Object.create({}, 0)
Object.create({}, '')
Object.create({}, false)
Object.create({}, undefined)
Object.create({}, null) // TypeError
```

如果 `propertiesObject` 参数传入原始值，执行到 `Object.defineProperties()` 时，会先类型转换为引用值（即 `Object(propertiesObject)`），我们知道 `undefined` 和 `null` 是无法转换为引用类型的，因此会抛出 `TypeError`。但由于 `Object.create()` 的第二个参数是允许指定为 `undefined` 的，因此需要特殊处理。

The end.
