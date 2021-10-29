# 手写系列 - call、apply、bind 的实现

这三个货，都是用来绑定 `this` 的。区别如下：

- `call()`、`apply()` 都返回函数执行结果，区别在于参数不一样，前者接收参数列表，后者接收一个数组参数（也可以是类数组）。
- `bind()` 返回一个新函数，但注意对使用 `new` 关键字调用时，绑定无效。其使用方法与 `call()` 一致，接受一个参数列表。

## 一、call 实现

假设没有 `Function.prototype.call()` 方法，我们利用 `this` 默认绑定的特性处理即可。

```js
Function.prototype.myCall() {
  // 获取执行函数
  const fn = this

  // 获取绑定对象，及参数列表
  const [context, ...args] = arguments

  // 避免与绑定对象属性冲突，采用 Symbol 值作为属性键，并将执行函数赋予该属性。
  const key = Symbol()
  context[key] = fn

  // 执行函数并返回结果
  const res = context[key](...args)

  // 移除临时属性
  delete context[key]

  // 返回结果
  return res
}
```

还没完，请注意以下两种情况：

- 当 `context` 为 `undefined` 或 `null` 的情况。若处于非严格模式，`context` 应指向顶层对象 `globalThis`，在浏览器为 `window` 对象。
- 若 `context` 为其他原始值（不是 `undefined`、`null`），应该要将其转换为对应的引用值。

```js
Function.prototype.myCall = function () {
  const fn = this
  const [ctx, ...args] = arguments
  const context = ctx == undefined ? window : Object(ctx)

  const key = Symbol()
  context[key] = fn

  const res = context[key](...args)
  delete context[key]

  return res
}
```

再简化一下：

```js
Function.prototype.myCall = function (ctx, ...args) {
  const key = Symbol()
  const context = ctx == undefined ? window : Object(ctx)

  context[key] = this
  const res = context[key](...args)
  delete context[key]

  return res
}
```

未完待续...
