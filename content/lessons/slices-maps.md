# Slice 与 Map

> 本章目标：掌握 Go 最常用的两种「容器」——动态数组 Slice 和键值表 Map。  
> 几乎所有真实程序都会用到它们。

---

<!-- section:start:03-01 -->

## 1. 为什么需要容器？

单个变量只能存一个值。如果要存：
- 一组用户（用户列表）
- 一份购物车（商品列表）
- 一张成绩表（名字→分数）
- 配置项（键→值）

就需要**容器**来组织这些数据。

Go 里初学者最该掌握的两个：

| 容器 | 类比 | 典型用途 |
|------|------|----------|
| **Slice** | 可变长度的有序列表 | 用户列表、标签、历史记录 |
| **Map** | 字典 / 哈希表 | 用户名→ID、配置项、计数器 |

---

## 2. 数组 vs Slice

Go 有**数组**，但日常开发几乎都用 **Slice**。

```go
// 数组：长度固定，很少直接用
var arr [3]int = [3]int{1, 2, 3}

// Slice：长度可变，推荐
nums := []int{1, 2, 3}
```

### 数组的特点

- 长度固定：`[3]int` 永远只能存 3 个元素
- 值类型：赋值或传参时会拷贝整个数组

```go
arr1 := [3]int{1, 2, 3}
arr2 := arr1  // 拷贝一份
arr2[0] = 100
fmt.Println(arr1)  // [1 2 3]（不受影响）
```

### Slice 的特点

- 长度可变：可以随时添加元素
- 引用类型：赋值或传参时共享底层数组

```go
s1 := []int{1, 2, 3}
s2 := s1      // 共享底层数组
s2[0] = 100
fmt.Println(s1)  // [100 2 3]（受影响！）
```

可以把 Slice 理解成：**动态数组**。

---

## 3. 创建 Slice 的几种方式

### 3.1 字面量（最常用）

```go
nums := []int{1, 2, 3}
names := []string{"Alice", "Bob"}
empty := []int{}           // 空 slice
```

### 3.2 用 `make`

```go
s := make([]int, 5)      // 长度 5，元素全是 0：[0 0 0 0 0]
s2 := make([]int, 3, 10) // 长度 3，容量 10
```

`make` 的第二个参数是**长度**，第三个参数是**容量**（可选）。

### 3.3 从数组「切」出来

```go
arr := [5]int{1, 2, 3, 4, 5}
part := arr[1:4]  // [2 3 4]，左闭右开
```

切片语法：`arr[起始索引:结束索引]`

```go
arr := [5]int{1, 2, 3, 4, 5}
fmt.Println(arr[0:3])  // [1 2 3]
fmt.Println(arr[:3])   // [1 2 3]（从开头到索引3）
fmt.Println(arr[2:])   // [3 4 5]（从索引2到结尾）
fmt.Println(arr[:])    // [1 2 3 4 5]（整个数组）
```

### 3.4 从其他 Slice 切出来

```go
s := []int{1, 2, 3, 4, 5}
sub := s[1:3]  // [2 3]
```

---

## 4. 访问与修改元素

下标从 **0** 开始：

```go
nums := []int{10, 20, 30}
fmt.Println(nums[0])  // 10
nums[1] = 99          // 修改为 [10, 99, 30]
```

越界会 **panic**（程序崩溃）：

```go
// nums[10] = 1  // ❌ 运行时错误：index out of range
```

---

## 5. `len` 和 `cap`

```go
nums := []int{1, 2, 3}
fmt.Println(len(nums))  // 3，当前元素个数
fmt.Println(cap(nums))  // 3，底层数组容量
```

### 什么是容量（capacity）？

Slice 内部有一个**底层数组**，容量就是这个数组能装多少元素。当 `len` 接近 `cap` 时，`append` 会自动扩容（分配新数组）。

```go
s := make([]int, 3, 10)
fmt.Println(len(s))  // 3
fmt.Println(cap(s))  // 10

s = append(s, 1, 2, 3, 4, 5, 6, 7)
fmt.Println(len(s))  // 10
fmt.Println(cap(s))  // 10（还没超出容量）

s = append(s, 11)
fmt.Println(len(s))  // 11
fmt.Println(cap(s))  // 20（扩容了，一般翻倍）
```

---

## 6. `append` — 追加元素

Slice 长度可变，靠 `append` 添加元素：

```go
nums := []int{1, 2}
nums = append(nums, 3)       // [1 2 3]
nums = append(nums, 4, 5)    // [1 2 3 4 5]
```

> **注意**：`append` 返回新的 slice，要**赋回变量**：`nums = append(nums, x)`

### 追加另一个 Slice

```go
a := []int{1, 2}
b := []int{3, 4}
c := append(a, b...)  // ... 表示把 b 展开
fmt.Println(c)  // [1 2 3 4]
```

---

## 7. 遍历 Slice：`for range`

```go
nums := []int{1, 2, 3}
for i, v := range nums {
    fmt.Println(i, v)
}
// 0 1
// 1 2
// 2 3

// 只要值，不要下标
for _, v := range nums {
    fmt.Println(v)
}
```

`_` 表示「这个值我不要」，是 Go 的惯用写法。

---

<!-- section:end:03-01 -->

<!-- section:start:03-02 -->

## 8. Slice 的高级操作

### 8.1 切片（Slice of Slice）

```go
s := []int{1, 2, 3, 4, 5}
sub := s[1:4]  // [2 3 4]
```

### 8.2 删除元素

```go
s := []int{1, 2, 3, 4, 5}

// 删除索引 2 的元素（值为 3）
s = append(s[:2], s[3:]...)
fmt.Println(s)  // [1 2 4 5]
```

**原理**：把索引 2 前面的元素和后面的元素拼在一起。

### 8.3 插入元素

```go
s := []int{1, 2, 4, 5}

// 在索引 2 的位置插入 3
s = append(s[:2], append([]int{3}, s[2:]...)...)
fmt.Println(s)  // [1 2 3 4 5]
```

### 8.4 复制 Slice

```go
a := []int{1, 2, 3}
b := make([]int, len(a))
copy(b, a)  // 把 a 复制到 b

b[0] = 100
fmt.Println(a)  // [1 2 3]（不受影响）
```

---

## 9. 多维 Slice

Slice 可以嵌套，形成二维或多维结构：

```go
// 二维切片：矩阵
matrix := [][]int{
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9},
}

fmt.Println(matrix[0])      // [1 2 3]
fmt.Println(matrix[0][1])   // 2

// 遍历二维切片
for i, row := range matrix {
    for j, val := range row {
        fmt.Printf("matrix[%d][%d] = %d\n", i, j, val)
    }
}
```

### 创建二维 Slice

```go
// 方式一：字面量
grid := [][]int{
    {1, 2},
    {3, 4},
}

// 方式二：分步创建
rows := 3
cols := 4
grid := make([][]int, rows)
for i := range grid {
    grid[i] = make([]int, cols)
}
```

---

<!-- section:end:03-02 -->

<!-- section:start:03-03 -->

## 10. Map — 键值对

Map 存 **key → value**，key 必须可比较（一般用 `string` 或 `int`）。

### 10.1 创建

```go
// 字面量
m := map[string]int{
    "apple":  5,
    "banana": 3,
}

// make
scores := make(map[string]int)
scores["小明"] = 95
```

### 10.2 取值

```go
m := map[string]int{"a": 1, "b": 2}
fmt.Println(m["a"])  // 1
fmt.Println(m["z"])  // 0（不存在的 key 返回零值，不是报错！）
```

### 10.3 判断 key 是否存在

```go
value, ok := m["a"]
if ok {
    fmt.Println("找到了:", value)
}

_, exists := m["z"]
if !exists {
    fmt.Println("key z 不存在")
}
```

这是 Go 的**双返回值**惯用法，非常重要！

### 10.4 修改和添加

```go
m := map[string]int{"a": 1}
m["a"] = 10    // 修改
m["b"] = 20    // 添加
fmt.Println(m)  // map[a:10 b:20]
```

### 10.5 删除

```go
delete(m, "a")
```

删除不存在的 key 不会报错。

### 10.6 遍历 Map

```go
for key, value := range m {
    fmt.Println(key, value)
}
```

**注意**：顺序**不固定**（Map 是无序的）。

### 10.7 获取 Map 长度

```go
m := map[string]int{"a": 1, "b": 2}
fmt.Println(len(m))  // 2
```

---

## 11. Map 的高级用法

### 11.1 Map 的 value 可以是任意类型

```go
// value 是切片
userTags := map[string][]string{
    "Alice": {"编程", "音乐"},
    "Bob":   {"运动"},
}

// value 是 map
config := map[string]map[string]string{
    "dev":  {"url": "http://localhost"},
    "prod": {"url": "https://api.example.com"},
}

// value 是结构体（后面章节会讲）
```

### 11.2 遍历 key 或 value

```go
m := map[string]int{"a": 1, "b": 2}

// 只遍历 key
for k := range m {
    fmt.Println(k)
}

// 只遍历 value
for _, v := range m {
    fmt.Println(v)
}
```

### 11.3 初始化 Map 的技巧

```go
// 方式一：字面量（推荐）
m := map[string]int{
    "a": 1,
    "b": 2,
}

// 方式二：make
m := make(map[string]int)
m["a"] = 1
m["b"] = 2

// 方式三：先声明，后初始化
var m map[string]int  // nil map
m = make(map[string]int)  // 初始化后才能用
m["a"] = 1
```

---

## 12. Slice 和 Map 的零值

| 类型 | 零值 | 能直接用吗 |
|------|------|------------|
| `[]int` | `nil` | 可以 `len`、`append`（但不建议，用 `make` 或字面量更清晰） |
| `map[string]int` | `nil` | **不能**写入，会 panic；要先 `make` 或字面量初始化 |

```go
var m map[string]int
// m["a"] = 1  // ❌ panic

m = make(map[string]int)
m["a"] = 1     // ✅
```

---

## 13. 打印时的默认格式

```go
fmt.Println([]int{1, 2, 3})           // [1 2 3]
fmt.Println(map[string]int{"a": 1})   // map[a:1]
```

判题时要注意输出格式和 `fmt.Println` 默认格式一致。

---

## 14. Slice 和 Map 的区别总结

| 特性 | Slice | Map |
|------|-------|-----|
| 存储方式 | 有序列表 | 键值对 |
| 访问方式 | 下标 | key |
| 是否有序 | 是 | 否 |
| 是否允许重复 | 是 | key 不允许重复 |
| 零值能否写入 | 可以（append） | 不可以（panic） |
| 遍历方式 | `for i, v := range` | `for k, v := range` |

---

## 15. 完整示例

```go
package main

import "fmt"

func main() {
    // Slice 操作
    fruits := []string{"苹果", "香蕉"}
    fruits = append(fruits, "橙子")
    fmt.Println("水果列表:", fruits)
    
    // 删除元素
    fruits = append(fruits[:1], fruits[2:]...)
    fmt.Println("删除香蕉后:", fruits)
    
    // 二维切片
    matrix := [][]int{
        {1, 2, 3},
        {4, 5, 6},
    }
    fmt.Println("矩阵:", matrix)
    
    // Map 操作
    stock := map[string]int{
        "apple":  10,
        "banana": 5,
    }
    stock["orange"] = 3
    fmt.Println("库存:", stock)
    
    // 判断 key 是否存在
    if count, ok := stock["apple"]; ok {
        fmt.Println("苹果库存:", count)
    }
    
    // 删除
    delete(stock, "banana")
    fmt.Println("删除香蕉后:", stock)
    
    // Map 的 value 是切片
    userTags := map[string][]string{
        "Alice": {"编程", "音乐"},
        "Bob":   {"运动"},
    }
    userTags["Alice"] = append(userTags["Alice"], "阅读")
    fmt.Println("用户标签:", userTags)
}
```

运行结果：
```
水果列表: [苹果 香蕉 橙子]
删除香蕉后: [苹果 橙子]
矩阵: [[1 2 3] [4 5 6]]
库存: map[apple:10 banana:5 orange:3]
苹果库存: 10
删除香蕉后: map[apple:10 orange:3]
用户标签: map[Alice:[编程 音乐 阅读] Bob:[运动]]
```

---

## 16. 常见错误

| 问题 | 说明 | 解决办法 |
|------|------|----------|
| 对 nil map 赋值 | 先 `make` 或字面量初始化 | `m = make(map[string]int)` |
| 忘了 `nums = append(...)` | append 返回新 slice，要接住 | `nums = append(nums, x)` |
| 以为 map 不存在的 key 会报错 | 实际返回零值，用 `ok` 判断 | `v, ok := m[key]` |
| 数组和 slice 搞混 | 日常写 `[]int{...}`，不要写 `[3]int` | 区分 `[]T` 和 `[N]T` |
| Slice 共享底层数组导致意外修改 | 复制 slice：`copy(b, a)` | 使用 copy 创建独立副本 |
| 越界访问 | 检查索引范围 | `if i >= 0 && i < len(s)` |

### 新手最容易犯的 5 个错误

1. **忘了把 append 结果赋回去**：
   ```go
   nums := []int{1, 2}
   append(nums, 3)  // ❌ 结果丢失
   nums = append(nums, 3)  // ✅
   ```

2. **对 nil map 赋值**：
   ```go
   var m map[string]int
   m["a"] = 1  // ❌ panic
   m = make(map[string]int)  // ✅ 先初始化
   ```

3. **以为 map 不存在的 key 会返回 nil**：
   ```go
   m := map[string]int{"a": 1}
   v := m["b"]  // v = 0，不是 nil
   ```

4. **混淆数组和切片的声明**：
   ```go
   arr := [3]int{1, 2, 3}  // 数组，长度固定
   s := []int{1, 2, 3}     // 切片，长度可变
   ```

5. **Slice 共享底层数组导致意外修改**：
   ```go
   a := []int{1, 2, 3}
   b := a[:2]
   b[0] = 100
   fmt.Println(a)  // [100 2 3]（被修改了！）
   ```

---

<!-- section:end:03-03 -->

## 17. 本章小结

| 概念 | 要点 |
|------|------|
| **Slice** | 有序、可变长，`[]T{...}` |
| `append` | 追加元素，返回新 slice |
| `len(s)` | 当前元素个数 |
| `cap(s)` | 底层数组容量 |
| `s[i:j]` | 切片操作（左闭右开） |
| `copy(dst, src)` | 复制 slice |
| **Map** | 键值对，`map[K]V` |
| `m[key]` | 取值（不存在返回零值） |
| `v, ok := m[key]` | 判断 key 是否存在 |
| `delete(m, key)` | 删除 key |
| `len(m)` | Map 长度 |

---

## 开始练习

本章 **4 道题**：

1. 创建 `[]int{1, 2, 3}` 并打印  
2. 创建 map 并打印 `m["a"]` 的值  
3. 用 `append` 给 slice 添加元素并打印  
4. 判断 map 的 key 是否存在，存在打印值，不存在打印 "not found"

建议自己再练：
- 实现 slice 的删除操作
- 创建二维切片并遍历
- 实现一个词频统计（字符串 → 出现次数）
