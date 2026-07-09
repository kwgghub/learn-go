# 结构体与指针

> 本章目标：学会用结构体组织复杂数据，理解指针如何避免拷贝、修改原对象。  
> Go 没有继承，但有结构体和组合——足够写出清晰的代码。

---

<!-- section:start:06-01 -->

## 1. 为什么需要结构体？

之前用的变量都是单个值：

```go
name := "Alice"
age := 20
city := "Beijing"
```

如果要表示一个「人」，把这些散的变量绑在一起会更方便：

```go
type Person struct {
    Name string
    Age  int
    City string
}
```

**结构体**就是把多个相关字段打包成一个新类型。

---

## 2. 定义结构体

```go
type 结构体名 struct {
    字段名 类型
    字段名 类型
    ...
}
```

示例：

```go
// 定义 Person 结构体
type Person struct {
    Name string
    Age  int
    City string
}

// 定义 Rectangle 结构体
type Rectangle struct {
    Width  float64
    Height float64
}
```

### 字段命名规则
- 首字母大写：可以被其他包访问（导出字段）
- 首字母小写：只能本包访问（私有字段）

```go
type User struct {
    Name string  // 导出，其他包能访问
    age  int     // 私有，只能本包访问
}
```

---

## 3. 创建结构体实例

### 方式一：字面量（最常用）

```go
p := Person{
    Name: "Alice",
    Age:  20,
    City: "Beijing",
}
fmt.Println(p)  // {Alice 20 Beijing}
```

### 方式二：按顺序赋值（不推荐，易出错）

```go
p := Person{"Bob", 25, "Shanghai"}
```

### 方式三：零值结构体

```go
var p Person  // 所有字段都是零值
// p.Name = ""
// p.Age = 0
// p.City = ""
```

### 方式四：使用 new

```go
p := new(Person)  // 返回指针 *Person
p.Name = "Charlie"
```

---

## 4. 访问字段

用 `.` 访问结构体的字段：

```go
p := Person{Name: "Alice", Age: 20}

// 读取字段
fmt.Println(p.Name)  // Alice
fmt.Println(p.Age)   // 20

// 修改字段
p.Age = 21
fmt.Println(p.Age)   // 21
```

### 嵌套结构体

结构体可以嵌套另一个结构体：

```go
type Address struct {
    Street string
    City   string
}

type Person struct {
    Name    string
    Age     int
    Address Address  // 嵌套 Address
}

p := Person{
    Name: "Alice",
    Age:  20,
    Address: Address{
        Street: "Main St",
        City:   "Beijing",
    },
}

// 访问嵌套字段
fmt.Println(p.Address.City)  // Beijing
```

<!-- section:end:06-01 -->

---

<!-- section:start:06-02 -->

## 5. 什么是指针？

**指针**是一个变量，它存储的是另一个变量的内存地址。

```go
var x int = 42
var p *int = &x  // p 是指向 x 的指针

fmt.Println(x)   // 42
fmt.Println(p)   // 0xc00001a0f0（内存地址）
fmt.Println(*p)  // 42（解引用，获取指针指向的值）
```

### 指针操作

| 操作符 | 含义 | 示例 |
|--------|------|------|
| `&` | 取地址 | `p := &x` |
| `*` | 解引用（获取指针指向的值） | `*p = 100` |

### 为什么需要指针？

1. **避免拷贝**：大结构体传值会拷贝整个结构体，传指针更高效
2. **修改原对象**：函数内修改指针指向的值，会影响外面的变量

```go
func addOne(x int) {
    x = x + 1  // 修改的是副本
}

func addOnePtr(x *int) {
    *x = *x + 1  // 修改的是原对象
}

func main() {
    n := 5
    addOne(n)
    fmt.Println(n)  // 还是 5
    
    addOnePtr(&n)
    fmt.Println(n)  // 变成 6
}
```

---

## 6. 指针与结构体

### 结构体指针

```go
p := Person{Name: "Alice", Age: 20}
ptr := &p  // ptr 是 *Person 类型

// 通过指针访问字段（Go 会自动解引用）
fmt.Println(ptr.Name)  // 等价于 (*ptr).Name
ptr.Age = 21           // 等价于 (*ptr).Age = 21
```

Go 会自动处理指针的解引用，所以 `ptr.Name` 和 `(*ptr).Name` 效果一样。

### 值接收者 vs 指针接收者

```go
type Circle struct {
    Radius float64
}

// 值接收者：操作的是副本
func (c Circle) Area() float64 {
    return 3.14 * c.Radius * c.Radius
}

// 指针接收者：操作的是原对象，可以修改字段
func (c *Circle) Scale(factor float64) {
    c.Radius = c.Radius * factor
}

func main() {
    c := Circle{Radius: 5}
    fmt.Println(c.Area())  // 78.5
    
    c.Scale(2)
    fmt.Println(c.Radius)  // 10（被修改了）
}
```

**选择原则**：
- 如果方法不需要修改结构体，用**值接收者**
- 如果方法需要修改结构体，用**指针接收者**
- 如果结构体很大，考虑用**指针接收者**避免拷贝

---

## 7. 方法

**方法**就是挂在类型上的函数：

```go
func (接收者 类型) 方法名(参数) 返回类型 {
    // 方法体
}
```

示例：

```go
type Rectangle struct {
    Width  float64
    Height float64
}

// 为 Rectangle 添加 Area 方法
func (r Rectangle) Area() float64 {
    return r.Width * r.Height
}

// 为 Rectangle 添加 Perimeter 方法
func (r Rectangle) Perimeter() float64 {
    return 2 * (r.Width + r.Height)
}

func main() {
    rect := Rectangle{Width: 4, Height: 3}
    fmt.Println(rect.Area())      // 12
    fmt.Println(rect.Perimeter()) // 14
}
```

### 方法与接口

实现接口需要注意接收者类型：

```go
type Stringer interface {
    String() string
}

type Person struct {
    Name string
}

// 值接收者
func (p Person) String() string {
    return "Person: " + p.Name
}

func main() {
    p := Person{Name: "Alice"}
    var s Stringer = p  // ✅ 可以
    fmt.Println(s)      // Person: Alice
}
```

---

<!-- section:end:06-02 -->

---

<!-- section:start:06-03 -->

## 8. 结构体组合（替代继承）

Go 没有继承，但可以用**组合**实现代码复用：

```go
type Animal struct {
    Name string
}

func (a Animal) Eat() {
    fmt.Println(a.Name, "is eating")
}

type Dog struct {
    Animal  // 嵌入 Animal
    Breed   string
}

func main() {
    d := Dog{
        Animal: Animal{Name: "旺财"},
        Breed:  "金毛",
    }
    
    d.Eat()  // 旺财 is eating（继承了 Animal 的方法）
    fmt.Println(d.Name)  // 旺财（继承了 Animal 的字段）
}
```

嵌入的结构体字段可以直接访问，不需要写 `d.Animal.Name`。

### 方法重写

如果嵌入类型和被嵌入类型有同名方法，优先调用外层的：

```go
func (d Dog) Eat() {
    fmt.Println(d.Name, "the", d.Breed, "is eating dog food")
}

d.Eat()  // 旺财 the 金毛 is eating dog food
```

---

## 9. 完整示例

```go
package main

import "fmt"

type Point struct {
    X, Y int
}

func (p Point) Distance(other Point) float64 {
    dx := p.X - other.X
    dy := p.Y - other.Y
    return float64(dx*dx + dy*dy)
}

func (p *Point) Move(dx, dy int) {
    p.X += dx
    p.Y += dy
}

type Circle struct {
    Center Point
    Radius float64
}

func (c Circle) Area() float64 {
    return 3.14159 * c.Radius * c.Radius
}

func main() {
    p1 := Point{X: 0, Y: 0}
    p2 := Point{X: 3, Y: 4}
    
    fmt.Println(p1.Distance(p2))  // 25（距离的平方）
    
    p1.Move(1, 2)
    fmt.Println(p1)  // {1 2}
    
    c := Circle{Center: Point{0, 0}, Radius: 5}
    fmt.Println(c.Area())  // 78.53975
}
```

---

## 10. 常见错误（新手必看）

| 错误信息 | 原因 | 解决办法 |
|----------|------|----------|
| `undefined: p.Name` | 字段名首字母小写，无法导出 | 改成大写 `Name` |
| `cannot assign to struct field` | 值接收者方法里无法修改字段 | 改成指针接收者 `(p *Person)` |
| `invalid pointer type` | 指针类型不匹配 | 检查指针类型是否正确 |
| `missing type in composite literal` | 结构体字面量缺少字段类型 | 使用 `Person{Name: "Alice"}` 格式 |

<!-- section:end:06-03 -->

---

## 11. 本章小结

| 概念 | 要点 |
|------|------|
| **结构体** | `type Name struct { 字段 类型 }` |
| 创建实例 | `p := Person{Name: "Alice"}` |
| 访问字段 | `p.Name` |
| **指针** | `&x` 取地址，`*p` 解引用 |
| 指针接收者 | `func (p *Person) SetName(n string)` |
| 值接收者 | `func (p Person) GetName() string` |
| **方法** | 挂在类型上的函数 |
| **组合** | 嵌入其他结构体实现复用 |