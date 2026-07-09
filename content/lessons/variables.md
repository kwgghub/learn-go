# 变量与基本类型

> 本章目标：掌握 Go 的常用数据类型，学会声明变量、使用常量和打印输出。  
> 学完之后，你就能让程序「记住」数据并显示出来。

---

<!-- section:start:02-01 -->

## 1. 为什么需要变量？

想象一下你正在写一个程序来计算学生成绩。你需要存储：
- 学生的名字
- 年龄
- 考试分数
- 是否通过考试

**变量**就是给这些数据起的名字，方便程序记住和使用。

```go
name := "小明"
age := 18
score := 95.5
passed := true

fmt.Println(name, "今年", age, "岁，分数", score, "，是否通过：", passed)
// 输出：小明 今年 18 岁，分数 95.5 ，是否通过： true
```

没有变量的话，你每次需要用这些数据都得重新写一遍，太麻烦了！

---

## 2. Go 的基本类型一览

Go 是**静态类型**语言：每个变量都有明确的类型，编译器会检查。这意味着：
- 你声明了一个整数变量，就不能往里面存字符串
- 编译器会帮你提前发现很多错误

### 2.1 类型分类总览

| 类型大类 | 具体类型 | 说明 | 示例 |
|----------|----------|------|------|
| **布尔型** | `bool` | 真或假 | `true`, `false` |
| **字符串** | `string` | 文字内容 | `"hello"`, `"你好"` |
| **有符号整数** | `int`, `int8`, `int16`, `int32`, `int64` | 正负数 | `42`, `-7`, `0` |
| **无符号整数** | `uint`, `uint8`, `uint16`, `uint32`, `uint64` | 非负数 | `0`, `255` |
| **浮点型** | `float32`, `float64` | 小数 | `3.14`, `-0.5` |
| **字符型** | `byte` (uint8), `rune` (int32) | 单个字符 | `'A'`, `'中'` |

### 2.2 整数类型详解

整数类型后面的数字表示**占用多少位**（bit）：

| 类型 | 位数 | 范围 | 用途 |
|------|------|------|------|
| `int8` | 8 | -128 ~ 127 | 小范围整数，如年龄 |
| `int16` | 16 | -32768 ~ 32767 | 中等范围整数 |
| `int32` | 32 | -21亿 ~ 21亿 | Unicode 字符（rune） |
| `int64` | 64 | 极大范围 | 大数值计算 |
| `int` | 32或64 | 取决于平台 | 通用整数，最常用 |

**无符号整数**（uint）只能表示非负数：

| 类型 | 位数 | 范围 | 用途 |
|------|------|------|------|
| `uint8` (byte) | 8 | 0 ~ 255 | 字节数据 |
| `uint16` | 16 | 0 ~ 65535 | 端口号等 |
| `uint32` | 32 | 0 ~ 42亿 | 大非负整数 |
| `uint64` | 64 | 极大非负范围 | 超大计数 |
| `uint` | 32或64 | 取决于平台 | 通用非负整数 |

### 2.3 浮点类型详解

| 类型 | 位数 | 精度 | 用途 |
|------|------|------|------|
| `float32` | 32 | ~6位有效数字 | 简单计算，节省内存 |
| `float64` | 64 | ~15位有效数字 | 高精度计算，最常用 |

**为什么 `float64` 更常用？**
```go
var pi32 float32 = 3.141592653589793
var pi64 float64 = 3.141592653589793

fmt.Println(pi32)  // 3.1415927（精度丢失）
fmt.Println(pi64)  // 3.141592653589793（精度保留）
```

### 2.4 字符类型

- `byte` = `uint8`，存储 ASCII 字符（英文字母、数字、符号）
- `rune` = `int32`，存储 Unicode 字符（中文、日文、表情等）

```go
var a byte = 'A'
var ch rune = '中'

fmt.Printf("%c 的 ASCII 码是 %d\n", a, a)  // A 的 ASCII 码是 65
fmt.Printf("%c 的 Unicode 码是 %d\n", ch, ch)  // 中的 Unicode 码是 20013
```

---

## 3. 声明变量的两种方式

### 方式一：`var` 关键字（完整声明）

```go
var age int = 18
var name string = "Gopher"
var score float64 = 95.5
var isStudent bool = true
```

**类型可省略（编译器自动推断）**：
```go
var city = "北京"    // 编译器推断为 string
var count = 0       // 编译器推断为 int
```

**只声明、先不赋值时，变量会是「零值」**：
```go
var count int     // 0
var ok bool       // false
var s string      // ""（空字符串）
var f float64     // 0.0
```

**同时声明多个变量**：
```go
var (
    name string = "Alice"
    age  int    = 25
    city string = "上海"
)
```

### 方式二：短变量声明 `:=`（函数内最常用）

```go
age := 18
name := "Gopher"
price := 3.14
isOpen := true
```

`:=` 会自动推断类型，**只能在函数内部使用**（比如 `main` 里）：

```go
func main() {
    x := 10      // ✅ 可以
}
// y := 20       // ❌ 函数外不能用 :=
```

**同时声明多个变量**：
```go
a, b := 1, 2
name, age := "Bob", 30
```

### 选哪种？

| 场景 | 推荐 | 原因 |
|------|------|------|
| `main` 或函数里临时变量 | `:=` | 简洁，自动推断类型 |
| 包级别变量、需要零值 | `var` | 可以在函数外面声明 |
| 明确要某种类型时 | `var x int64 = 100` | 避免类型推断错误 |
| 需要批量声明多个变量 | `var (...)` | 整齐易读 |

<!-- section:end:02-01 -->

---

<!-- section:start:02-02 -->

## 4. 常量 `const`

常量一旦定义，**永远不能修改**：

```go
const Pi = 3.14
const AppName = "learn-go"

// Pi = 3.1415  // ❌ 编译错误：cannot assign to Pi
```

适合：数学常数、配置项、状态码等不会变的值。

### 多个常量可以写在一起：

```go
const (
    StatusOK    = 200
    StatusError = 500
    StatusNotFound = 404
)
```

### 常量的自动递增

```go
const (
    Monday = iota  // 0
    Tuesday        // 1
    Wednesday      // 2
    Thursday       // 3
)
```

`iota` 是常量计数器，每次 `const` 块内递增 1。

---

## 5. 打印输出：`Println` vs `Printf` vs `Print`

### `fmt.Println` — 简单打印（最常用）

自动在参数之间加空格，末尾换行：

```go
fmt.Println("年龄", 18)
// 输出：年龄 18

fmt.Println(18)
// 输出：18

fmt.Println("Hello", "World")
// 输出：Hello World
```

### `fmt.Printf` — 格式化打印（需要精确控制格式）

用**占位符**控制格式：

```go
name := "Go"
age := 13
fmt.Printf("%s 今年 %d 岁\n", name, age)
// 输出：Go 今年 13 岁
```

#### 常用占位符一览：

| 占位符 | 含义 | 示例 |
|--------|------|------|
| `%d` | 整数（decimal） | `%d` → `42` |
| `%f` | 浮点数（float） | `%f` → `3.14` |
| `%.2f` | 浮点数（保留2位小数） | `%.2f` → `3.14` |
| `%s` | 字符串（string） | `%s` → `"hello"` |
| `%v` | 万能（什么类型都能打） | `%v` → 任意值 |
| `%+v` | 万能（显示字段名） | `%+v` → `{Name:Alice Age:20}` |
| `%t` | 布尔值（true/false） | `%t` → `true` |
| `%c` | 字符 | `%c` → `'A'` |
| `%T` | 类型名 | `%T` → `int` |
| `\n` | 换行 | 换行符 |
| `\t` | 制表符 | 缩进 |

#### 更多 `Printf` 示例：

```go
price := 99.9
fmt.Printf("价格：%.2f 元\n", price)
// 输出：价格：99.90 元

name := "小明"
age := 18
fmt.Printf("我叫 %s，今年 %d 岁\n", name, age)
// 输出：我叫 小明，今年 18 岁
```

### `fmt.Print` — 不自动换行

和 `Println` 类似，但不自动换行：

```go
fmt.Print("Hello")
fmt.Print(" ")
fmt.Print("World")
// 输出：Hello World
```

### 三者区别总结

| 函数 | 自动空格 | 自动换行 | 常用场景 |
|------|----------|----------|----------|
| `fmt.Print` | 否 | 否 | 手动控制格式 |
| `fmt.Println` | 是 | 是 | 简单打印，日常用 |
| `fmt.Printf` | 否 | 否 | 精确格式化输出 |

<!-- section:end:02-02 -->

---

<!-- section:start:02-03 -->

## 6. 类型转换

Go **不会**自动把 `int` 变成 `float64`，必须**显式转换**：

```go
var i int = 42
var f float64 = float64(i)  // 把 int 转成 float64
fmt.Println(f)  // 42.0
```

### 为什么需要显式转换？

防止你不小心把整数除法变成浮点数除法：

```go
var x int = 3
var y int = 4

// 整数除法：结果是 0（舍去小数）
fmt.Println(x / y)  // 0

// 显式转换成浮点数后再除：结果是 0.75
var z float64 = float64(x) / float64(y)
fmt.Println(z)  // 0.75
```

### 常见转换示例

```go
// int → float64
num := 10
f := float64(num)

// float64 → int（会截断小数部分）
price := 99.9
discount := int(price)  // 99

// string → int（需要用 strconv 包）
// 这是高级用法，后面章节会讲
```

---

## 7. 字符串基础

### 创建字符串

```go
s1 := "Hello"
s2 := "世界"
s3 := "你好，Go！"
```

### 字符串拼接

用 `+` 拼接：

```go
greeting := "Hello" + ", " + "World"
fmt.Println(greeting)  // Hello, World
```

也可以用 `fmt.Sprintf` 拼接：

```go
name := "小明"
message := fmt.Sprintf("你好，%s！", name)
fmt.Println(message)  // 你好，小明！
```

### 字符串长度

```go
s := "Hello"
fmt.Println(len(s))  // 5（字节长度）

chinese := "你好"
fmt.Println(len(chinese))  // 6（中文字符在 UTF-8 里占 3 个字节）
```

> **小白提示**：中文字符在 UTF-8 编码里占 3 个字节，所以 `len("你好")` 是 6 不是 2。如果你想知道有多少个字符，需要用 `utf8.RuneCountInString()`：
> ```go
> import "unicode/utf8"
> fmt.Println(utf8.RuneCountInString("你好"))  // 2
> ```

### 字符串是不可变的

```go
s := "hello"
// s[0] = 'H'  // ❌ 编译错误：cannot assign to s[0]
```

如果需要修改字符串，要先转成 `[]byte` 或 `[]rune`：

```go
s := "hello"
b := []byte(s)
b[0] = 'H'
fmt.Println(string(b))  // Hello
```

---

## 8. 布尔与比较运算

### 布尔值

```go
isAdult := true
isStudent := false

fmt.Println(isAdult)     // true
fmt.Println(!isStudent)  // true（取反）
```

### 比较运算

```go
age := 20
isAdult := age >= 18   // true

fmt.Println(3 > 2)     // true
fmt.Println(3 == 3)    // true（相等用 ==，不是 =）
fmt.Println(3 != 2)    // true（不等于）
fmt.Println(3 <= 5)    // true
```

### 逻辑运算

```go
fmt.Println(true && false)  // false（与：两个都为 true 才是 true）
fmt.Println(true || false)  // true（或：有一个为 true 就是 true）
fmt.Println(!true)          // false（非：取反）
```

### 组合使用

```go
age := 25
hasJob := true

if age >= 18 && age <= 60 && hasJob {
    fmt.Println("在职成年人")
}
```

---

## 9. 运算符优先级（从高到低）

| 优先级 | 运算符 | 说明 |
|--------|--------|------|
| 1 | `*` `/` `%` | 乘、除、取模 |
| 2 | `+` `-` | 加、减 |
| 3 | `<` `>` `<=` `>=` | 比较 |
| 4 | `==` `!=` | 相等、不等 |
| 5 | `&&` | 与 |
| 6 | `\|\|` | 或 |

```go
// 先乘除后加减
fmt.Println(2 + 3 * 4)  // 14（不是 20）

// 先比较后逻辑
fmt.Println(3 > 2 && 5 < 10)  // true
```

---

## 10. 完整示例

```go
package main

import "fmt"

func main() {
    // 短变量声明
    name := "Gopher"
    age := 13
    score := 95.5
    isStudent := true

    // 常量
    const Lang = "Go"
    const Pi = 3.14159

    // 打印方式一：Println
    fmt.Println("姓名:", name)
    fmt.Println("年龄:", age)
    fmt.Println("分数:", score)
    fmt.Println("是学生:", isStudent)

    // 打印方式二：Printf（格式化）
    fmt.Printf("\n%s 语言的吉祥物是 %s，今年 %d 岁\n", Lang, name, age)
    fmt.Printf("圆周率大约是 %.2f\n", Pi)

    // 类型转换
    var price int = 99
    fmt.Printf("原价 %d 元，打八折后是 %.2f 元\n", price, float64(price)*0.8)

    // 布尔运算
    isAdult := age >= 18
    fmt.Printf("%s 是成年人吗？%t\n", name, isAdult)
}
```

运行结果：
```
姓名: Gopher
年龄: 13
分数: 95.5
是学生: true

Go 语言的吉祥物是 Gopher，今年 13 岁
圆周率大约是 3.14
原价 99 元，打八折后是 79.20 元
Gopher 是成年人吗？false
```

---

## 11. 常见错误（新手必看）

| 错误信息 | 原因 | 解决办法 |
|----------|------|----------|
| `no new variables on left side of :=` | 左边变量都已存在 | 改用 `=` 赋值，或换个变量名 |
| `cannot use x (type int) as type float64` | 类型不匹配 | 显式转换：`float64(x)` |
| `declared and not used` | 声明了变量却没用 | 要么用掉它，要么删掉 |
| `constant ... is not a valid constant` | const 值必须是编译期能确定的 | 不能用运行时计算结果 |
| `missing '}'` | 括号没配对 | 检查花括号是否成对 |
| `syntax error: unexpected newline` | 语法错误 | 检查分号、括号、引号 |

### 新手最容易犯的 5 个错误

1. **把 `=` 当成 `==`**：
   ```go
   if age = 18 { }  // ❌ 这是赋值，不是比较
   if age == 18 { } // ✅ 正确
   ```

2. **在函数外用 `:=`**：
   ```go
   x := 10  // ❌ 函数外面不能用 :=
   var x = 10  // ✅ 用 var
   ```

3. **忘了 `import "fmt"`**：
   ```go
   fmt.Println("Hello")  // ❌ undefined: fmt
   ```

4. **变量声明了但没使用**：
   ```go
   var name = "Alice"  // ❌ declared and not used
   fmt.Println(name)   // ✅ 用掉它
   ```

5. **字符串用单引号**：
   ```go
   fmt.Println('Hello')  // ❌ 单引号是字符，不是字符串
   fmt.Println("Hello")  // ✅ 双引号才是字符串
   ```

---

---

## 12. 变量作用域

### 什么是作用域？

**作用域**指的是变量能被访问的范围：

```go
var global = "全局变量"  // 整个包都能访问

func main() {
    var local = "局部变量"  // 只有 main 函数内可以访问
    fmt.Println(local)  // ✅ 可以访问
}

func other() {
    fmt.Println(local)  // ❌ 不能访问，local 在 main 里
}
```

### 作用域类型

| 类型 | 范围 | 示例 |
|------|------|------|
| **包级变量** | 整个包 | `var x int` 在函数外面 |
| **函数级变量** | 当前函数 | `x := 10` 在函数里面 |
| **块级变量** | 当前代码块（`{}`） | `if`、`for` 内的变量 |
| **参数** | 当前函数 | `func foo(x int)` |

### 块级作用域

```go
func main() {
    x := 1
    if x > 0 {
        y := 2  // y 只在 if 块内有效
        fmt.Println(y)  // ✅
    }
    fmt.Println(y)  // ❌ y 不存在
}
```

### 变量遮蔽（Shadowing）

内层变量会遮蔽外层同名变量：

```go
func main() {
    x := 1
    fmt.Println(x)  // 1
    
    {
        x := 2  // 这是一个新变量，不是修改外层的 x
        fmt.Println(x)  // 2
    }
    
    fmt.Println(x)  // 1（外层的 x 没变）
}
```

### 最佳实践

1. **尽量缩小作用域**：变量只在需要的地方声明
2. **避免变量遮蔽**：不要在内层用和外层相同的变量名
3. **包级变量慎用**：只有需要在多个函数间共享时才用

---

<!-- section:end:02-03 -->

## 13. 本章小结

| 概念 | 记住这一句 |
|------|------------|
| `var name type = value` | 完整变量声明 |
| `name := value` | 短变量声明（函数内用） |
| `const NAME = value` | 常量，不能修改 |
| 基本类型 | `int`、`float64`、`string`、`bool` |
| `fmt.Println()` | 简单打印，自动换行 |
| `fmt.Printf()` | 格式化打印，用占位符 |
| 类型转换 | Go 不自动转换，需要显式写 `float64(x)` |
| `len(s)` | 字符串的字节长度 |

---

## 开始练习

本章 **4 道题**：

1. 声明变量 `age` 为 18 并打印  
2. 用 `:=` 声明 `name := "Gopher"` 并打印  
3. 定义常量 `Pi = 3.14` 并打印  
4. 用 `Printf` 格式化输出：`My name is Alice, I'm 20 years old`

建议对照教程里的示例，**自己敲一遍**再做题。做完后可以试试：
- 用 `%.2f` 格式化浮点数
- 用 `%T` 查看变量类型
- 尝试不同的类型转换
