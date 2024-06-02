# JavaScript 探秘：用 parseInt() 进行数值转换

> [原文](https://web.archive.org/web/20210423074859/http://www.nowamagic.net/librarys/veda/detail/1628)

使用 `parseInt()` 你可以从字符串中获取数值，该方法接受另一个基数参数，这经常省略，但不应该。当字符串以 `0` 开头的时候就有可能会出问题，例如，部分时间进入表单域，在 ECMAScript 3 中，开头为 `0` 的字符串被当做 8 进制处理了，但这已在 ECMAScript 5 中改变了。为了避免矛盾和意外的结果，总是指定基数参数。

```js
var month = '05',
  year = '09'
month = parseInt(month, 10)
year = parseInt(year, 10)
alert(month)
alert(year)
```

[运行](https://codepen.io/tofrankie/pen/yLWMRbN)

此例中，如果你忽略了基数参数，如 parseInt(year)，返回的值将是 0，因为“09”被当做 8 进制（好比执行 parseInt( year, 8 )），而 09 在 8 进制中不是个有效数字。

替换方法是将字符串转换成数字，包括：

```js
+'08' // 结果是 8
Number('08') // 8
```

这些通常快于 `parseInt()`，因为 `parseInt()` 方法，顾名思意，不是简单地解析与转换。但是，如果你想输入例如 `08 hello`，`parseInt()` 将返回数字，而其它以 `NaN` 告终。
