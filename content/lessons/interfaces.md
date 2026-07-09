# 接口（Interface）

> 本章目标：理解 Go 的接口是什么、怎么「隐式实现」，并实现标准库 `fmt.Stringer` 接口。  
> 接口是 Go 最优雅的设计之一——**不需要写 implements，编译器自动检查**。

---

<!-- section:start:09-01 -->

## 1. 接口解决什么问题？

假设你要打印不同类型的数据：

```go
type Person struct { Name string }
type Product struct { Title string }
```

希望 `fmt.Println(p)` 时输出好看一点，而不是 `{Alice}` 这种默认格式。

**接口**定义了一种「能力契约」：只要你实现了约定的方法，就算实现了这个接口。

想象一下：
- 「会叫」是一个接口
- 狗实现了「会叫」接口（汪汪）
- 猫实现了「会叫」接口（喵喵）
- 机器人实现了「会叫」接口（哔哔）
- 你只需要调用「叫」这个方法，不用关心是谁在叫

---

## 2. 接口是什么？

接口就是**方法的集合**：

```go
type Stringer interface {
    String() string
}
```

含义：任何类型，只要有 `String() string` 这个方法，就实现了 `Stringer` 接口。

### 接口的组成

| 部分 | 说明 |
|------|------|
| `type` | 关键字，声明类型 |
| `Stringer` | 接口名 |
| `interface` | 关键字，表明这是接口 |
| `String() string` | 接口要求的方法（方法名 + 参数 + 返回类型） |

---

## 3. 隐式实现 — Go 和 Java 最大的不同

### Java 的方式（显式声明）

```java
class Person implements Stringer {
    // ...
}
```

### Go 的方式（隐式实现）

```go
type Person struct {
    Name string
}

// 只要有这个方法，Person 就自动实现了 fmt.Stringer
func (p Person) String() string {
    return "Person: " + p.Name
}
```

编译器在编译期检查，不需要 `implements` 关键字。

**好处**：
- 不需要修改类型定义就能实现新接口
- 避免了继承带来的耦合
- 更灵活，更易于扩展

---

## 4. 实现 `fmt.Stringer`

标准库 `fmt` 包在打印值时，如果类型实现了 `Stringer`，会调用 `String()`：

```go
package main

import "fmt"

type Person struct {
    Name string
}

func (p Person) String() string {
    return "Person: " + p.Name
}

func main() {
    p := Person{Name: "Alice"}
    fmt.Println(p)  // Person: Alice（不是 {Alice}）
}
```

注意输出格式：`Person: Alice`（题目要求这种格式）。

---

## 5. 方法 receiver 简要说明

```go
func (p Person) String() string
//   ^ receiver，表示这是 Person 的方法
```

### 值接收者 vs 指针接收者

| 类型 | 说明 | 示例 |
|------|------|------|
| `(p Person)` | 值接收者，操作副本 | `func (p Person) String() string` |
| `(p *Person)` | 指针接收者，可修改原对象 | `func (p *Person) SetName(name string)` |

```go
type Person struct {
    Name string
}

// 值接收者
func (p Person) GetName() string {
    return p.Name
}

// 指针接收者（可以修改原对象）
func (p *Person) SetName(name string) {
    p.Name = name
}

func main() {
    p := Person{Name: "Alice"}
    fmt.Println(p.GetName())  // Alice
    
    p.SetName("Bob")
    fmt.Println(p.GetName())  // Bob
}
```

### 什么时候用值接收者，什么时候用指针接收者？

| 场景 | 推荐 |
|------|------|
| 方法不修改接收者 | 值接收者 |
| 方法需要修改接收者 | 指针接收者 |
| 接收者是大结构体（考虑性能） | 指针接收者 |
| 接收者是 map、slice、channel（引用类型） | 值接收者即可 |

`String()` 一般用值接收者就够了（只读数据）。

---

## 6. 接口的用处：多态

接口类型的变量，可以装**任何实现了该接口的类型**：

```go
func printIt(s fmt.Stringer) {
    fmt.Println(s.String())
}

type Person struct { Name string }
func (p Person) String() string { return "Person: " + p.Name }

type Product struct { Title string }
func (p Product) String() string { return "Product: " + p.Title }

func main() {
    printIt(Person{Name: "Bob"})
    printIt(Product{Title: "Book"})
}
```

输出：
```
Person: Bob
Product: Book
```

函数参数写接口类型，而不是写死具体结构体——**依赖抽象，不依赖具体**，方便扩展和测试。

---

## 7. 空接口 `interface{}` / `any`

空接口没有方法，**任何类型**都实现了它：

```go
func describe(v any) {
    fmt.Printf("类型 %T，值 %v\n", v, v)
}

describe(42)
describe("hello")
describe(Person{Name: "A"})
```

Go 1.18+ 可以用 `any` 代替 `interface{}`。

### 空接口的用途

- 存储任意类型的数据
- 作为函数参数，接收任意类型
- 作为 map 的 value 类型

```go
// map 的 value 可以是任意类型
data := map[string]any{
    "name": "Alice",
    "age":  20,
    "tags": []string{"编程", "音乐"},
}
```

### 注意事项

初学知道即可，不要滥用——能用具体类型或明确接口时，优先用明确的。空接口会丧失类型安全性，需要运行时类型检查。

---

<!-- section:end:09-01 -->

---

<!-- section:start:09-02 -->

## 8. 类型断言

从接口里取出具体类型：

### 基本用法

```go
var i any = Person{Name: "Alice"}
p, ok := i.(Person)
if ok {
    fmt.Println(p.Name)  // Alice
}
```

### 带类型断言的 switch

```go
var i any = 42

switch v := i.(type) {
case int:
    fmt.Printf("是整数: %d\n", v)
case string:
    fmt.Printf("是字符串: %s\n", v)
case Person:
    fmt.Printf("是 Person: %s\n", v.Name)
default:
    fmt.Printf("未知类型: %T\n", v)
}
```

这是**类型断言**的一种常见用法，用于处理空接口。

---

## 9. 接口组合

接口可以组合其他接口，形成更大的接口：

```go
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// ReaderWriter 组合了 Reader 和 Writer
type ReaderWriter interface {
    Reader
    Writer
}
```

`ReaderWriter` 包含了 `Read` 和 `Write` 两个方法。

### 标准库中的接口组合

```go
// io.ReadCloser = io.Reader + io.Closer
type ReadCloser interface {
    Reader
    Closer
}
```

---

## 10. 接口的零值

接口的零值是 `nil`：

```go
var s fmt.Stringer  // nil
fmt.Println(s == nil)  // true
```

对 `nil` 接口调用方法会 panic：

```go
var s fmt.Stringer
// s.String()  // ❌ panic: nil pointer dereference
```

---

## 11. 常用标准库接口（先混个脸熟）

| 接口 | 方法 | 用途 |
|------|------|------|
| `fmt.Stringer` | `String() string` | 自定义打印格式 |
| `error` | `Error() string` | 错误类型 |
| `io.Reader` | `Read([]byte) (int, error)` | 读数据 |
| `io.Writer` | `Write([]byte) (int, error)` | 写数据 |
| `io.Closer` | `Close() error` | 关闭资源 |

### `error` 接口

```go
type error interface {
    Error() string
}
```

你已经在 `if err != nil` 里见过了，本质也是接口：

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}

result, err := divide(10, 0)
if err != nil {
    fmt.Println("出错了:", err)
    return
}
fmt.Println("结果:", result)
```

---

<!-- section:end:09-02 -->

---

<!-- section:start:09-03 -->

## 12. 接口的实际应用：日志系统

```go
package main

import "fmt"

// Logger 接口：任何实现了 Log 方法的类型都可以当日志器
type Logger interface {
    Log(message string)
}

// ConsoleLogger 控制台日志
type ConsoleLogger struct{}

func (c ConsoleLogger) Log(message string) {
    fmt.Println("[Console]", message)
}

// FileLogger 文件日志
type FileLogger struct {
    Filename string
}

func (f FileLogger) Log(message string) {
    fmt.Printf("[File:%s] %s\n", f.Filename, message)
}

// 使用日志器
func process(logger Logger) {
    logger.Log("开始处理")
    logger.Log("处理完成")
}

func main() {
    console := ConsoleLogger{}
    file := FileLogger{Filename: "app.log"}
    
    process(console)
    process(file)
}
```

输出：
```
[Console] 开始处理
[Console] 处理完成
[File:app.log] 开始处理
[File:app.log] 处理完成
```

---

## 13. 完整示例：Shape 接口

```go
package main

import "fmt"

// Shape 接口：所有形状都实现 Area() 和 Perimeter()
type Shape interface {
    Area() float64
    Perimeter() float64
    String() string
}

// Circle 圆形
type Circle struct {
    Radius float64
}

func (c Circle) Area() float64 {
    return 3.14159 * c.Radius * c.Radius
}

func (c Circle) Perimeter() float64 {
    return 2 * 3.14159 * c.Radius
}

func (c Circle) String() string {
    return fmt.Sprintf("Circle(r=%.2f)", c.Radius)
}

// Rectangle 矩形
type Rectangle struct {
    Width  float64
    Height float64
}

func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}

func (r Rectangle) String() string {
    return fmt.Sprintf("Rectangle(w=%.2f, h=%.2f)", r.Width, r.Height)
}

// 计算多个形状的总面积
func totalArea(shapes []Shape) float64 {
    total := 0.0
    for _, s := range shapes {
        total += s.Area()
    }
    return total
}

func main() {
    circle := Circle{Radius: 5}
    rect := Rectangle{Width: 4, Height: 3}
    
    fmt.Println(circle)
    fmt.Println("面积:", circle.Area())
    fmt.Println("周长:", circle.Perimeter())
    
    fmt.Println("\n", rect)
    fmt.Println("面积:", rect.Area())
    fmt.Println("周长:", rect.Perimeter())
    
    // 多态：用接口类型的切片
    shapes := []Shape{circle, rect}
    fmt.Printf("\n总面积: %.2f\n", totalArea(shapes))
}
```

运行结果：
```
Circle(r=5.00)
面积: 78.53975
周长: 31.4159

 Rectangle(w=4.00, h=3.00)
面积: 12
周长: 14

总面积: 90.54
```

---

## 14. 常见错误

| 错误 | 说明 | 解决办法 |
|------|------|----------|
| 方法签名差一个字母 | `String()` 必须完全一致，不能叫 `ToString()` | 严格匹配方法名和参数 |
| receiver 类型不对 | 定义了 `(p *Person)` 但用值调用通常也行，反之要注意 | 值类型调用指针方法会自动取地址 |
| 输出格式多空格 | 判题对字符串精确匹配，注意题目要求的格式 | 仔细检查输出格式 |
| 以为要显式声明 implements | Go 没有这种语法 | 不需要声明，有方法就行 |
| 对 nil 接口调用方法 | 会 panic | 先检查 `if s != nil` |
| 类型断言失败 | 接口里的值不是目标类型 | 用 `v, ok := i.(Type)` 判断 |

### 新手最容易犯的 5 个错误

1. **方法名写错**：
   ```go
   func (p Person) ToString() string { }  // ❌ 不是 String()
   func (p Person) String() string { }    // ✅
   ```

2. **方法参数或返回值不对**：
   ```go
   func (p Person) String() { }  // ❌ 少了返回值
   func (p Person) String() string { }  // ✅
   ```

3. **对 nil 接口调用方法**：
   ```go
   var s fmt.Stringer
   s.String()  // ❌ panic
   ```

4. **类型断言时忽略 ok**：
   ```go
   p := i.(Person)  // ❌ 如果 i 不是 Person 会 panic
   p, ok := i.(Person)  // ✅ 安全
   ```

5. **以为接口能存具体值**：
   ```go
   var s fmt.Stringer = "hello"  // ❌ string 没有 String() 方法
   var s fmt.Stringer = Person{}  // ✅ Person 有 String() 方法
   ```

---

<!-- section:end:09-03 -->

## 15. 本章小结

| 概念 | 要点 |
|------|------|
| **接口** | 方法集合，描述「能做什么」 |
| **隐式实现** | 有方法就算实现，不用声明 |
| `fmt.Stringer` | `String()` 控制 `fmt.Println` 的输出 |
| **方法** | 挂在类型上：`func (p Person) String() string` |
| **值接收者** | `(p Person)`，操作副本 |
| **指针接收者** | `(p *Person)`，可修改原对象 |
| **多态** | 接口变量可以装任意实现类型 |
| **空接口** | `any`，任何类型都实现 |
| **类型断言** | `v, ok := i.(Type)` |
| **接口组合** | 接口可以嵌入其他接口 |

---

## 开始练习

本章 **2 道题**：

1. 定义 `Person` 结构体，实现 `String()`，使 `fmt.Println(p)` 输出 `Person: Alice`  
2. 定义 `Shape` 接口（包含 `Area() float64`），实现 `Circle` 类型

建议自己再练：
- 给 `Person` 加 `Age` 字段，让 `String()` 输出更丰富的信息
- 实现 `Rectangle` 类型，也实现 `Shape` 接口
- 写一个函数接收 `[]Shape`，计算总面积
