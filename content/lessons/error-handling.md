# 错误处理

> 本章目标：掌握 Go 的错误处理模式，学会优雅地处理程序中的异常情况。  
> Go 没有 try-catch，但有更简洁的错误处理方式。

---

<!-- section:start:07-01 -->

## 1. Go 如何处理错误？

在 Go 中，错误是一种值——通过返回值传递：

```go
result, err := someFunction()
if err != nil {
    // 处理错误
    fmt.Println("出错了:", err)
    return
}
// 使用 result
```

### 为什么不用 try-catch？

Go 的设计者认为：
- 错误处理应该是显式的，不能被忽略
- 每个函数的错误路径都应该被考虑到
- 简单的 `if err != nil` 足够清晰

---

## 2. error 接口

Go 的 `error` 是一个接口：

```go
type error interface {
    Error() string
}
```

任何实现了 `Error() string` 方法的类型都可以作为错误。

### 创建错误

```go
import "errors"

// 方式一：使用 errors.New
err := errors.New("something went wrong")

// 方式二：使用 fmt.Errorf（支持格式化）
err := fmt.Errorf("failed to open file: %s", filename)

// 方式三：自定义错误类型
type MyError struct {
    Msg string
    Code int
}

func (e *MyError) Error() string {
    return fmt.Sprintf("error %d: %s", e.Code, e.Msg)
}
```

---

## 3. 返回错误的惯例

```go
func DoSomething() (ResultType, error) {
    // 成功时返回结果和 nil
    if success {
        return result, nil
    }
    // 失败时返回零值和错误
    return ResultType{}, errors.New("failed")
}
```

### 检查错误

```go
data, err := LoadData()
if err != nil {
    // 记录日志、返回错误、或者终止程序
    log.Fatal(err)
}
```

### 错误包装

```go
func OpenFile(name string) (*os.File, error) {
    f, err := os.Open(name)
    if err != nil {
        // 添加上下文信息
        return nil, fmt.Errorf("open file %q: %w", name, err)
    }
    return f, nil
}
```

`%w` 动词用于包装错误，可以用 `errors.Is` 和 `errors.As` 解包。

---

## 4. errors.Is 和 errors.As

### errors.Is

检查错误是否是某个特定错误：

```go
import "errors"

var ErrNotFound = errors.New("not found")

func FindUser(id int) (*User, error) {
    if id == 0 {
        return nil, ErrNotFound
    }
    return &User{ID: id}, nil
}

user, err := FindUser(0)
if errors.Is(err, ErrNotFound) {
    fmt.Println("用户不存在")
}
```

### errors.As

将错误转换为特定类型：

```go
type NotFoundError struct {
    Resource string
    ID       int
}

func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s not found: id=%d", e.Resource, e.ID)
}

user, err := FindUser(0)
var notFoundErr *NotFoundError
if errors.As(err, &notFoundErr) {
    fmt.Printf("%s %d 不存在\n", notFoundErr.Resource, notFoundErr.ID)
}
```

---

<!-- section:end:07-01 -->

---

<!-- section:start:07-02 -->

## 5. panic 和 recover

### panic

`panic` 用于严重错误，会终止程序：

```go
func main() {
    fmt.Println("开始")
    panic("严重错误！")
    fmt.Println("结束")  // 不会执行
}
```

**什么时候用 panic？**
- 程序无法继续运行（配置文件缺失）
- 内部逻辑错误（不可能发生的情况）
- 测试中发现预期外的错误

### recover

`recover` 用于捕获 panic，让程序继续运行：

```go
func main() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("恢复了:", r)
        }
    }()
    
    panic("严重错误！")
    fmt.Println("继续执行")
}
```

**注意**：`recover` 必须在 `defer` 函数中使用。

### defer + panic + recover 模式

```go
func SafeRun(f func()) {
    defer func() {
        if r := recover(); r != nil {
            log.Printf("panic recovered: %v", r)
        }
    }()
    f()
}

func main() {
    SafeRun(func() {
        panic("出错了")
    })
    fmt.Println("程序继续运行")
}
```

---

## 6. defer 详解

`defer` 会在函数返回前执行：

```go
func main() {
    defer fmt.Println("最后执行")
    fmt.Println("首先执行")
}
```

### 多个 defer 的执行顺序

后进先出（LIFO）：

```go
func main() {
    defer fmt.Println("1")
    defer fmt.Println("2")
    defer fmt.Println("3")
    // 输出：3, 2, 1
}
```

### defer 的用途

1. **资源释放**：关闭文件、数据库连接
2. **日志记录**：记录函数执行时间
3. **错误恢复**：捕获 panic

```go
func ReadFile(filename string) (string, error) {
    f, err := os.Open(filename)
    if err != nil {
        return "", err
    }
    defer f.Close()  // 函数返回前关闭文件
    
    data, err := io.ReadAll(f)
    if err != nil {
        return "", err
    }
    return string(data), nil
}
```

---

## 7. 错误处理最佳实践

### 不要忽略错误

```go
// ❌ 错误
f, _ := os.Open("file.txt")  // 忽略错误

// ✅ 正确
f, err := os.Open("file.txt")
if err != nil {
    return err
}
```

### 向上传递错误时添加上下文

```go
func LoadConfig() (*Config, error) {
    data, err := os.ReadFile("config.json")
    if err != nil {
        return nil, fmt.Errorf("read config: %w", err)
    }
    
    var cfg Config
    if err := json.Unmarshal(data, &cfg); err != nil {
        return nil, fmt.Errorf("parse config: %w", err)
    }
    return &cfg, nil
}
```

### 对于不可恢复的错误，使用 log.Fatal

```go
func main() {
    cfg, err := LoadConfig()
    if err != nil {
        log.Fatal(err)  // 打印错误并退出
    }
    // ...
}
```

---

<!-- section:end:07-02 -->

---

<!-- section:start:07-03 -->

## 8. 自定义错误类型

```go
type AppError struct {
    Code    int
    Message string
    Err     error  // 原始错误
}

func (e *AppError) Error() string {
    if e.Err != nil {
        return fmt.Sprintf("error %d: %s: %v", e.Code, e.Message, e.Err)
    }
    return fmt.Sprintf("error %d: %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error {
    return e.Err
}

// 使用
func DoSomething() error {
    if err := validateInput(); err != nil {
        return &AppError{
            Code:    400,
            Message: "invalid input",
            Err:     err,
        }
    }
    return nil
}
```

### 错误码约定

| 错误码 | 含义 |
|--------|------|
| 400 | 请求参数错误 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |
| 503 | 服务不可用 |

---

## 9. 完整示例

```go
package main

import (
    "errors"
    "fmt"
    "log"
)

var (
    ErrNotFound = errors.New("not found")
    ErrInvalid  = errors.New("invalid argument")
)

type User struct {
    ID   int
    Name string
}

func GetUser(id int) (*User, error) {
    if id <= 0 {
        return nil, fmt.Errorf("%w: id=%d", ErrInvalid, id)
    }
    
    users := map[int]User{
        1: {ID: 1, Name: "Alice"},
        2: {ID: 2, Name: "Bob"},
    }
    
    user, ok := users[id]
    if !ok {
        return nil, fmt.Errorf("%w: user id=%d", ErrNotFound, id)
    }
    return &user, nil
}

func main() {
    user, err := GetUser(0)
    if err != nil {
        if errors.Is(err, ErrInvalid) {
            log.Println("参数错误:", err)
        } else if errors.Is(err, ErrNotFound) {
            log.Println("用户不存在:", err)
        } else {
            log.Println("未知错误:", err)
        }
        return
    }
    fmt.Printf("找到用户: %+v\n", user)
}
```

---

## 10. 常见错误（新手必看）

| 错误信息 | 原因 | 解决办法 |
|----------|------|----------|
| `cannot use err (type error) as type *MyError in assignment` | 直接赋值错误类型 | 使用 `errors.As` 转换 |
| `nil pointer dereference` | 访问 nil 指针的字段 | 检查指针是否为 nil |
| `defer called outside function` | defer 在函数外使用 | 将 defer 移到函数内 |
| `recover() called with no active panic` | 在没有 panic 的地方调用 recover | 只在 defer 中调用 |

<!-- section:end:07-03 -->

---

## 11. 本章小结

| 概念 | 要点 |
|------|------|
| **error 接口** | `Error() string` |
| 创建错误 | `errors.New()`、`fmt.Errorf()` |
| 检查错误 | `if err != nil` |
| 错误包装 | `fmt.Errorf("context: %w", err)` |
| **errors.Is** | 检查错误是否匹配 |
| **errors.As** | 转换错误类型 |
| **panic** | 严重错误，终止程序 |
| **recover** | 捕获 panic，恢复程序 |
| **defer** | 函数返回前执行 |