# 条件与循环

> 本章目标：用 `if`、`for`、`switch` 控制程序走哪条路、重复做某件事。  
> Go 的控制流比很多语言更简洁——**没有 while，for 一种写法走天下**。

---

<!-- section:start:04-01 -->

## 1. 程序为什么需要分支和循环？

想象一下你在写一个游戏程序：

**分支的场景**：
- 如果玩家血量 > 0，继续游戏；否则，游戏结束
- 如果玩家等级 >= 10，解锁新技能；否则，提示升级

**循环的场景**：
- 打印 1 到 100 的数字
- 遍历玩家背包里的所有物品
- 让游戏画面每秒刷新 60 次

---

## 2. `if` 条件判断

### 2.1 基本写法

```go
age := 20
if age >= 18 {
    fmt.Println("成年人")
} else {
    fmt.Println("未成年")
}
// 输出：成年人
```

### 2.2 `if` 里可以带短语句（Go 特色）

在判断之前执行一行，且变量**只在这个 if-else 块里有效**：

```go
if x := 10; x > 5 {
    fmt.Println("big")
} else {
    fmt.Println("small")
}
// 这里不能用 x
```

这种写法能减少临时变量污染外层作用域，后面错误处理章节会大量使用。

### 2.3 多条件 `else if`

```go
score := 85
if score >= 90 {
    fmt.Println("A")
} else if score >= 80 {
    fmt.Println("B")
} else if score >= 70 {
    fmt.Println("C")
} else {
    fmt.Println("D")
}
// 输出：B
```

### 2.4 注意：条件不用括号

```go
if (x > 0) { }  // 能编译，但不推荐（画蛇添足）
if x > 0 { }    // ✅ Go 风格
```

### 2.5 条件必须是布尔值

Go 不会自动把其他类型转换成布尔值：

```go
num := 10
// if num { }  // ❌ 编译错误：non-bool (int) used as condition
if num > 0 { } // ✅ 正确
```

<!-- section:end:04-01 -->

---

<!-- section:start:04-02 -->

## 3. `for` 循环 — Go 唯一的循环

Go **没有** `while`，所有循环都用 `for`。这反而让代码更统一，不用记多种写法。

### 3.1 经典三段式

```go
for i := 0; i < 5; i++ {
    fmt.Println(i)
}
// 0 1 2 3 4
```

**三段式各部分含义**：

| 部分 | 含义 | 执行时机 |
|------|------|----------|
| `i := 0` | 初始化（只执行一次） | 循环开始前 |
| `i < 5` | 条件判断（每次循环前检查） | 每次迭代 |
| `i++` | 后处理（每次循环后执行） | 每次迭代后 |

**执行流程**：
1. 执行 `i := 0`（初始化）
2. 检查 `i < 5` → true，进入循环体
3. 执行 `fmt.Println(i)` → 打印 0
4. 执行 `i++` → i 变成 1
5. 检查 `i < 5` → true，进入循环体
6. ... 重复直到 `i < 5` 为 false

### 3.2 类似 while（只有条件）

```go
n := 0
for n < 3 {
    fmt.Println(n)
    n++
}
// 0 1 2
```

等价于其他语言的 `while n < 3 { ... }`。

### 3.3 无限循环（没有条件）

```go
count := 0
for {
    fmt.Println("循环中...")
    count++
    if count >= 3 {
        break  // 跳出循环
    }
}
// 循环中...
// 循环中...
// 循环中...
```

`for { }` 就是无限循环，必须用 `break` 跳出。

### 3.4 `for range` 遍历（最常用）

遍历数组、切片、字符串、Map：

```go
// 遍历切片
nums := []int{10, 20, 30}
for i, v := range nums {
    fmt.Println(i, v)
}
// 0 10
// 1 20
// 2 30

// 遍历字符串
s := "hello"
for index, char := range s {
    fmt.Printf("索引 %d: %c\n", index, char)
}
// 索引 0: h
// 索引 1: e
// 索引 2: l
// 索引 3: l
// 索引 4: o

// 遍历 Map
m := map[string]int{"a": 1, "b": 2}
for key, value := range m {
    fmt.Println(key, value)
}
// a 1
// b 2
```

**只要值，不要下标**：

```go
for _, v := range nums {
    fmt.Println(v)
}
```

`_` 表示「这个值我不要」，是 Go 的惯用写法。

---

## 4. `break` 与 `continue`

### 4.1 `continue` — 跳过本次循环

```go
for i := 0; i < 5; i++ {
    if i == 2 {
        continue  // 跳过 i=2，直接进入下一轮
    }
    fmt.Println(i)
}
// 0 1 3 4
```

### 4.2 `break` — 跳出整个循环

```go
for i := 0; i < 10; i++ {
    if i == 5 {
        break  // 跳出整个循环
    }
    fmt.Println(i)
}
// 0 1 2 3 4
```

### 4.3 带标签的 `break`/`continue`（处理嵌套循环）

```go
outer:
for i := 0; i < 3; i++ {
    for j := 0; j < 3; j++ {
        if i == 1 && j == 1 {
            break outer  // 跳出外层循环
        }
        fmt.Printf("(%d, %d) ", i, j)
    }
}
// (0, 0) (0, 1) (0, 2) (1, 0)
```

<!-- section:end:04-02 -->

---

<!-- section:start:04-03 -->

## 5. `switch` — 多分支选择

比一长串 `if else if` 更清晰：

```go
day := "Mon"
switch day {
case "Mon":
    fmt.Println("星期一")
case "Tue", "Wed":
    fmt.Println("周二或周三")
default:
    fmt.Println("其他")
}
```

### 5.1 不需要 `break`

Go 的 `switch` **默认不会贯穿**到下一个 case（和 C/Java 不同）：

```go
switch x {
case 1:
    fmt.Println("one")  // 打完就结束，不会继续 case 2
case 2:
    fmt.Println("two")
}
```

需要贯穿时显式写 `fallthrough`（很少用）：

```go
switch x {
case 1:
    fmt.Println("one")
    fallthrough  // 继续执行 case 2
case 2:
    fmt.Println("two")
}
```

### 5.2 `switch` 也可以带短语句

```go
switch hour := 14; {
case hour < 12:
    fmt.Println("上午")
case hour >= 12 && hour < 18:
    fmt.Println("下午")
default:
    fmt.Println("晚上")
}
// 输出：下午
```

### 5.3 无标签 switch（代替 if-else 链）

```go
x := 10
switch {
case x < 0:
    fmt.Println("负")
case x == 0:
    fmt.Println("零")
default:
    fmt.Println("正")
}
// 输出：正
```

### 5.4 switch 可以比较不同类型

```go
var i interface{} = "hello"
switch v := i.(type) {
case int:
    fmt.Printf("是整数: %d\n", v)
case string:
    fmt.Printf("是字符串: %s\n", v)
default:
    fmt.Printf("未知类型: %T\n", v)
}
// 输出：是字符串: hello
```

这是**类型断言**的一种用法，后面接口章节会讲。

---

## 6. 比较与逻辑运算符

| 运算符 | 含义 | 示例 |
|--------|------|------|
| `==` | 相等 | `3 == 3` → true |
| `!=` | 不等 | `3 != 2` → true |
| `<` | 小于 | `3 < 5` → true |
| `>` | 大于 | `3 > 2` → true |
| `<=` | 小于等于 | `3 <= 3` → true |
| `>=` | 大于等于 | `3 >= 2` → true |
| `&&` | 与（两个都为 true 才是 true） | `true && false` → false |
| `\|\|` | 或（有一个为 true 就是 true） | `true \|\| false` → true |
| `!` | 非（取反） | `!true` → false |

### 组合使用示例

```go
age := 25
hasJob := true
hasCar := false

// 检查是否是在职成年人
if age >= 18 && age <= 60 && hasJob {
    fmt.Println("在职成年人")
}

// 检查是否满足任一条件
if age < 18 || hasCar {
    fmt.Println("未成年或有车")
}

// 检查是否既没有工作也没有车
if !hasJob && !hasCar {
    fmt.Println("既没工作也没车")
}
```

---

## 7. 嵌套循环

循环里面套循环，常用于二维数据：

```go
// 打印乘法口诀表（九九表）
for i := 1; i <= 9; i++ {
    for j := 1; j <= i; j++ {
        fmt.Printf("%d×%d=%d\t", j, i, i*j)
    }
    fmt.Println()
}
```

输出：
```
1×1=1	
1×2=2	2×2=4	
1×3=3	2×3=6	3×3=9	
...
```

---

## 8. 经典练习：FizzBuzz

这是一道经典的编程面试题，非常适合练习条件和循环。

**题目**：打印 1 到 100 的数字，遇到 3 的倍数打印 "Fizz"，遇到 5 的倍数打印 "Buzz"，既是 3 又是 5 的倍数打印 "FizzBuzz"。

```go
package main

import "fmt"

func main() {
    for i := 1; i <= 15; i++ {  // 先试 1-15
        if i%3 == 0 && i%5 == 0 {
            fmt.Println("FizzBuzz")
        } else if i%3 == 0 {
            fmt.Println("Fizz")
        } else if i%5 == 0 {
            fmt.Println("Buzz")
        } else {
            fmt.Println(i)
        }
    }
}
```

输出：
```
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
```

---

## 9. 经典练习：猜数字游戏

```go
package main

import "fmt"

func main() {
    target := 42
    var guess int
    
    for {
        fmt.Print("猜一个数字：")
        fmt.Scan(&guess)
        
        if guess == target {
            fmt.Println("恭喜，猜对了！")
            break
        } else if guess < target {
            fmt.Println("太小了，再试一次")
        } else {
            fmt.Println("太大了，再试一次")
        }
    }
}
```

---

## 10. 完整示例：成绩统计

```go
package main

import "fmt"

func main() {
    scores := []int{85, 92, 78, 65, 90, 88, 72}
    
    // 统计不及格人数
    failCount := 0
    for _, score := range scores {
        if score < 60 {
            failCount++
        }
    }
    fmt.Printf("不及格人数：%d\n", failCount)
    
    // 找出最高分
    maxScore := scores[0]
    for _, score := range scores {
        if score > maxScore {
            maxScore = score
        }
    }
    fmt.Printf("最高分：%d\n", maxScore)
    
    // 根据分数评级
    for _, score := range scores {
        var grade string
        switch {
        case score >= 90:
            grade = "A"
        case score >= 80:
            grade = "B"
        case score >= 70:
            grade = "C"
        default:
            grade = "D"
        }
        fmt.Printf("分数 %d → 等级 %s\n", score, grade)
    }
}
```

运行结果：
```
不及格人数：1
最高分：92
分数 85 → 等级 B
分数 92 → 等级 A
分数 78 → 等级 C
分数 65 → 等级 D
分数 90 → 等级 A
分数 88 → 等级 B
分数 72 → 等级 C
```

---

## 11. 常见错误

| 错误 | 原因 | 解决办法 |
|------|------|----------|
| `i := 0; i < n; i++` 分号写错 | for 三段用 `;` 分隔，不是 `,` | 检查分号 |
| 无限循环出不来 | 循环变量没有更新 | 检查 `i++` 是否在循环内 |
| `if x = 5` | 赋值用 `=`，比较用 `==` | 改成 `if x == 5` |
| range 的 key/value 顺序搞反 | `for k, v := range m` | key 在前，value 在后 |
| switch case 里忘了写语句 | case 后面必须有语句 | 至少写一行 |
| 在 for 外面用循环变量 | 循环变量只在循环内有效 | 在循环外声明变量 |

### 新手最容易犯的 5 个错误

1. **把 `=` 当成 `==`**：
   ```go
   if age = 18 { }  // ❌ 这是赋值
   if age == 18 { } // ✅ 正确
   ```

2. **for 循环里忘了 `i++`**：
   ```go
   for i := 0; i < 5; {  // ❌ 死循环！
       fmt.Println(i)
       i++  // ✅ 加上这个
   }
   ```

3. **花括号换行**：
   ```go
   if x > 0
   { }  // ❌ 编译错误
   if x > 0 { }  // ✅ 正确
   ```

4. **在 `if` 外面用 `:=` 声明的变量**：
   ```go
   if x := 10; x > 0 {
       fmt.Println(x)
   }
   // fmt.Println(x)  // ❌ x 不存在了
   ```

5. **switch 后面加了括号**：
   ```go
   switch (x) { }  // ❌ Go 不需要括号
   switch x { }    // ✅ 正确
   ```

---

<!-- section:end:04-03 -->

## 12. 本章小结

| 语法 | 用途 | 示例 |
|------|------|------|
| `if / else` | 条件分支 | `if x > 0 { } else { }` |
| `if x := ...; cond` | 带初始化的 if | `if n := len(s); n > 0 { }` |
| `for i := 0; i < n; i++` | 计数循环 | 打印 1 到 n |
| `for cond` | 类似 while | `for n > 0 { }` |
| `for { }` | 无限循环 | 需要 break 跳出 |
| `for range` | 遍历 slice/map/string | `for i, v := range s` |
| `switch` | 多路分支 | `switch x { case 1: }` |
| `switch { }` | 无标签 switch | `switch { case x > 0: }` |
| `break` | 跳出循环 | 退出整个循环 |
| `continue` | 跳过本次 | 进入下一轮循环 |

---

## 开始练习

本章 **4 道题**：

1. 用 `if` 判断 `x := 10` 是否大于 5，打印 `big` 或 `small`  
2. 用 `for` 循环打印 1 到 3，每行一个数字  
3. 用 `for range` 遍历 `[]int{10, 20, 30}` 并打印每个元素  
4. 用 `switch` 判断星期几，输入 "Mon" 输出 "星期一"

建议自己再练：
- 完整实现 FizzBuzz（1-100）
- 用嵌套循环打印三角形
- 写一个简单的猜数字游戏
