# 函数

> 本章目标：学会定义和调用函数，理解参数、返回值，以及 Go 标志性的**多返回值**。  
> 函数是代码复用的基本单位——写一次，到处调。

---

<!-- section:start:05-01 -->

## 1. 为什么需要函数？

假设你要算三次两数之和：

```go
fmt.Println(1 + 2)
fmt.Println(3 + 4)
fmt.Println(5 + 6)
```

如果改成「加法」逻辑变了（比如要加 1），要改三处。用**函数**包起来：

```go
func add(a, b int) int {
    return a + b
}

fmt.Println(add(1, 2))
fmt.Println(add(3, 4))
fmt.Println(add(5, 6))
```

改一处，处处生效。

**函数的好处**：
- **复用**：写一次，到处用
- **清晰**：起个好名字，一看就懂
- **易维护**：改逻辑只需改一处
- **可测试**：单独测试一个函数

---

## 2. 函数的基本语法

```go
func 函数名(参数列表) 返回类型 {
    // 函数体
    return 结果
}
```

示例：

```go
func greet(name string) {
    fmt.Println("Hello,", name)
}

func double(x int) int {
    return x * 2
}
```

调用：

```go
greet("Go")
n := double(21)  // 42
```

---

## 3. 多个参数

### 3.1 同类型参数可简写

```go
func add(a, b int) int {
    return a + b
}

func swap(a, b string) (string, string) {
    return b, a
}
```

### 3.2 不同类型要分开写

```go
func info(name string, age int) {
    fmt.Println(name, age)
}
```

### 3.3 可变参数 `...`

函数可以接收任意数量的参数：

```go
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

fmt.Println(sum(1, 2, 3))    // 6
fmt.Println(sum(1, 2, 3, 4)) // 10
```

`fmt.Println` 就用了可变参数，所以你能写：
```go
fmt.Println(a, b, c, d)
```

---

## 4. 多返回值 — Go 的招牌特性

Go 函数可以返回**多个值**，不需要像 Python 那样打包成 tuple，也不需要像 Java 那样只能返回一个对象。

```go
func div(a, b int) (int, int) {
    quotient := a / b
    remainder := a % b
    return quotient, remainder
}

q, r := div(10, 3)
fmt.Println(q, r)  // 3 1
```

### 只关心其中一个？用 `_` 丢弃

```go
q, _ := div(10, 3)  // 只要商，不要余数
_, r := div(10, 3)  // 只要余数，不要商
```

Map 取值时的 `value, ok := m[key]` 也是这个模式。

---

## 5. 命名返回值

可以给返回值起名字，函数里可以直接用，最后用裸 `return`：

```go
func div(a, b int) (q, r int) {
    q = a / b
    r = a % b
    return  // 自动返回 q, r
}
```

适合返回值比较多的情况，让代码更清晰：

```go
func stats(nums []int) (count int, sum int, avg float64) {
    count = len(nums)
    for _, n := range nums {
        sum += n
    }
    if count > 0 {
        avg = float64(sum) / float64(count)
    }
    return
}
```

---

## 6. 没有返回值

```go
func sayHi() {
    fmt.Println("Hi!")
}

func printSeparator() {
    fmt.Println("==========")
}
```

---

<!-- section:end:05-01 -->

<!-- section:start:05-02 -->

## 7. 值传递

Go 函数参数默认是**值传递**——传进去的是副本，改副本不影响外面：

```go
func addOne(x int) {
    x = x + 1
}

n := 5
addOne(n)
fmt.Println(n)  // 还是 5
```

**为什么？** 因为函数里操作的是 `x` 的副本，不是原来的 `n`。

要修改外面的变量，需要传**指针**（后面结构体章节会讲）。初学阶段记住：普通类型传进去，函数里改参数不会影响外面。

---

## 8. 递归函数

函数可以调用自己，这就是**递归**：

```go
func factorial(n int) int {
    if n == 0 {
        return 1
    }
    return n * factorial(n-1)
}

fmt.Println(factorial(5))  // 120（5! = 5×4×3×2×1×1）
```

**递归的条件**：
1. **基线条件**：什么时候停止递归（`n == 0`）
2. **递归条件**：调用自己，参数越来越接近基线条件

### 递归示例：斐波那契数列

```go
func fib(n int) int {
    if n <= 1 {
        return n
    }
    return fib(n-1) + fib(n-2)
}

fmt.Println(fib(10))  // 55
```

### 递归要注意什么？

- 必须有基线条件，否则会无限递归（栈溢出）
- 递归深度不能太大（Go 默认栈大小有限）
- 某些情况下递归效率不如循环

---

## 9. 作用域

**作用域**指的是变量能被访问的范围：

```go
var global = "全局变量"  // 整个包都能访问

func main() {
    var local = "局部变量"  // 只在 main 里能访问
    fmt.Println(global)     // ✅ 可以
    fmt.Println(local)      // ✅ 可以
}

// fmt.Println(local)  // ❌ 不能访问
```

### 块级作用域

```go
func main() {
    x := 10
    if x > 5 {
        y := 20  // 只在 if 块里能访问
        fmt.Println(y)  // ✅
    }
    // fmt.Println(y)  // ❌ y 不存在了
}
```

### 作用域规则总结

| 变量声明位置 | 作用域 |
|--------------|--------|
| 包级别（函数外面） | 整个包 |
| 函数内部 | 整个函数 |
| if/for/switch 块内 | 只在块内 |

---

## 10. 函数也是一等公民

在 Go 中，函数也是一种类型，可以：
- 赋值给变量
- 作为参数传递
- 作为返回值

### 函数类型

```go
var op func(int, int) int

func add(a, b int) int {
    return a + b
}

op = add
fmt.Println(op(3, 4))  // 7
```

### 函数作为参数

```go
func apply(a, b int, f func(int, int) int) int {
    return f(a, b)
}

func add(a, b int) int { return a + b }
func mul(a, b int) int { return a * b }

fmt.Println(apply(3, 4, add))  // 7
fmt.Println(apply(3, 4, mul))  // 12
```

### 匿名函数

```go
result := apply(3, 4, func(a, b int) int {
    return a * b
})
fmt.Println(result)  // 12
```

---

## 11. 闭包

闭包是一个函数，它可以访问定义时周围的变量，即使在外部调用时也能记住这些变量：

```go
func counter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

c := counter()
fmt.Println(c())  // 1
fmt.Println(c())  // 2
fmt.Println(c())  // 3
```

**闭包的特点**：
- 内部函数可以访问外部函数的变量
- 即使外部函数已经返回，内部函数仍然能访问这些变量
- 每个闭包实例有自己的变量副本

---

<!-- section:end:05-02 -->

<!-- section:start:05-03 -->

## 12. defer — 延迟执行

`defer` 语句会把函数调用推迟到当前函数返回前执行：

```go
func main() {
    defer fmt.Println("最后执行")
    fmt.Println("先执行")
}
// 输出：
// 先执行
// 最后执行
```

### 多个 defer 的执行顺序（后进先出）

```go
func main() {
    defer fmt.Println("1")
    defer fmt.Println("2")
    defer fmt.Println("3")
}
// 输出：
// 3
// 2
// 1
```

### 常见用途：资源清理

```go
func readFile(filename string) {
    file, err := os.Open(filename)
    if err != nil {
        return
    }
    defer file.Close()  // 文件操作完后自动关闭
    
    // 读取文件...
}
```

---

## 13. 函数命名规范

| 规则 | 说明 | 示例 |
|------|------|------|
| 首字母大写 | 可以被其他包调用（导出） | `func Add(a, b int) int` |
| 首字母小写 | 只能本包调用（私有） | `func add(a, b int) int` |
| 动词开头 | 函数是做动作的 | `GetUser`, `SaveData`, `CalculatePrice` |
| 简洁清晰 | 一看就知道做什么 | `Print` 而不是 `PrintSomething` |

---

## 14. 完整示例

```go
package main

import "fmt"

func add(a, b int) int {
    return a + b
}

func div(a, b int) (int, int) {
    return a / b, a % b
}

func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}

func factorial(n int) int {
    if n == 0 {
        return 1
    }
    return n * factorial(n-1)
}

func counter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}

func main() {
    fmt.Println("add(3, 4) =", add(3, 4))
    
    q, r := div(10, 3)
    fmt.Println("div(10, 3) =", q, "余", r)
    
    fmt.Println("sum(1,2,3,4) =", sum(1, 2, 3, 4))
    
    fmt.Println("factorial(5) =", factorial(5))
    
    c := counter()
    fmt.Println("counter:", c())
    fmt.Println("counter:", c())
}
```

运行结果：
```
add(3, 4) = 7
div(10, 3) = 3 余 1
sum(1,2,3,4) = 10
factorial(5) = 120
counter: 1
counter: 2
```

---

## 15. 常见错误

| 错误 | 说明 | 解决办法 |
|------|------|----------|
| `missing return` | 声明了返回类型却忘了 return | 确保所有路径都有 return |
| 返回值数量不匹配 | `q := div(10, 3)` 需要两个接收变量 | 用 `q, _ := div(10, 3)` |
| 函数名大小写 | 大写开头可被其他包调用，小写只能本包用 | 导出函数首字母大写 |
| 在 `main` 下面定义函数 | 可以，Go 不要求顺序 | 没问题 |
| 递归没有基线条件 | 会导致栈溢出 | 加上 `if n == 0 { return ... }` |
| defer 后面忘了加括号 | `defer file.Close` 不会执行 | 写 `defer file.Close()` |

### 新手最容易犯的 5 个错误

1. **忘记 return**：
   ```go
   func add(a, b int) int {
       a + b  // ❌ 没 return
       return a + b  // ✅
   }
   ```

2. **多返回值接收数量不对**：
   ```go
   q := div(10, 3)  // ❌ 需要两个变量
   q, r := div(10, 3)  // ✅
   ```

3. **把函数名当成变量用**：
   ```go
   fmt.Println(add)  // ❌ 会打印函数地址
   fmt.Println(add(1, 2))  // ✅ 调用函数
   ```

4. **递归缺少基线条件**：
   ```go
   func fact(n int) int {
       return n * fact(n-1)  // ❌ 无限递归
   }
   ```

5. **defer 后面没加括号**：
   ```go
   defer file.Close  // ❌ 不会关闭文件
   defer file.Close()  // ✅
   ```

---

<!-- section:end:05-03 -->

## 16. 本章小结

| 概念 | 要点 |
|------|------|
| 定义 | `func name(参数) 返回类型 { }` |
| 多返回值 | `return a, b`，接收用 `x, y := f()` |
| 忽略返回值 | 用 `_` |
| 同类型参数 | `a, b int` 可简写 |
| 可变参数 | `nums ...int` |
| 值传递 | 普通类型传副本 |
| 递归 | 函数调用自己，要有基线条件 |
| 闭包 | 内部函数访问外部变量 |
| defer | 函数返回前执行 |
| 导出函数 | 首字母大写 |

---

## 开始练习

本章 **4 道题**：

1. 实现 `add(a, b int) int`，在 main 里打印 `add(3, 4)`  
2. 实现 `div(a, b int) (int, int)` 返回商和余数  
3. 实现 `sum(nums ...int) int` 求和  
4. 实现 `factorial(n int) int` 计算阶乘

建议自己再练：
- 写一个 `max(a, b int) int` 返回较大值
- 写一个递归函数计算斐波那契数列
- 用闭包实现一个计数器
