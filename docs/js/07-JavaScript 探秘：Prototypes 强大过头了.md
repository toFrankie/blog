# JavaScript 探秘：Prototypes 强大过头了

> [原文](https://web.archive.org/web/20210414194119/http://www.nowamagic.net/librarys/veda/detail/1626)

扩增构造函数的 prototype 属性是个很强大的增加功能的方法，但有时候它太强大了。

增加内置的构造函数原型（如 `Object()`, `Array()`, 或 `Function()`）挺诱人的，但是这严重降低了可维护性，因为它让你的代码变得难以预测。使用你代码的其他开发人员很可能更期望使用内置的 JavaScript 方法来持续不断地工作，而不是你另加的方法。

另外，属性添加到原型中，可能会导致不使用 `hasOwnProperty` 属性时在循环中显示出来，这会造成混乱。

因此，不增加内置原型是最好的。你可以指定一个规则，仅当下面的条件均满足时例外：

- 可以预期将来的 ECMAScript 版本或是 JavaScript 实现将一直将此功能当作内置方法来实现。例如，你可以添加 ECMAScript 5 中描述的方法，一直到各个浏览器都迎头赶上。这种情况下，你只是提前定义了有用的方法。
- 如果您检查您的自定义属性或方法已不存在——也许已经在代码的其他地方实现或已经是你支持的浏览器 JavaScript 引擎部分。
- 你清楚地文档记录并和团队交流了变化。

如果这三个条件得到满足，你可以给原型进行自定义的添加，形式如下：

```js
if (typeof Object.protoype.myMethod !== 'function') {
  Object.protoype.myMethod = function () {
    // 实现...
  }
}
```
