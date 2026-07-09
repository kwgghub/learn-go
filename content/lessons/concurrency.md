# 并发编程

> 本章目标：掌握 Go 的并发模型，学会用 goroutine 和 channel 编写并发程序。  
> Go 让并发变得简单——这是 Go 最强大的特性之一。

---

<!-- section:start:08-01 -->

## 1. 什么是并发？

**并发**：多个任务在同一时间段内交替执行。

**并行**：多个任务在同一时刻同时执行。

Go 的并发模型基于 **CSP**（Communicating Sequential Processes）：
- 每个 goroutine 是一个独立的执行单元
- 通过 channel 在 goroutine 之间传递数据
- 不要共享内存来通信，要通过通信来共享内存

---

## 2. goroutine

**goroutine** 是 Go 语言的轻量级线程：

```go
func main() {
    go sayHello()  // 启动一个 goroutine
    fmt.Println("main")
    
    // 等待 goroutine 完成（否则程序会立即退出）
    time.Sleep(time.Second)
}

func sayHello() {
    fmt.Println("hello")
}
```

### 为什么 goroutine 很轻量？

- 每个 goroutine 初始栈大小只有 **2KB**
- 栈会根据需要自动扩展/收缩
- 一个程序可以轻松创建成千上万个 goroutine

### 启动多个 goroutine

```go
func main() {
    for i := 0; i < 5; i++ {
        go func(n int) {
            fmt.Println("goroutine", n)
        }(i)  // 注意：立即传参
    }
    time.Sleep(time.Second)
}
```

---

## 3. sync.WaitGroup

使用 `sync.WaitGroup` 等待多个 goroutine 完成：

```go
import "sync"

func main() {
    var wg sync.WaitGroup
    
    for i := 0; i < 5; i++ {
        wg.Add(1)  // 增加计数
        go func(n int) {
            defer wg.Done()  // 减少计数
            fmt.Println("goroutine", n)
        }(i)
    }
    
    wg.Wait()  // 等待所有 goroutine 完成
    fmt.Println("所有 goroutine 完成")
}
```

### WaitGroup 用法

| 方法 | 作用 |
|------|------|
| `wg.Add(n)` | 增加等待计数 |
| `wg.Done()` | 减少等待计数（等价于 `wg.Add(-1)`） |
| `wg.Wait()` | 阻塞直到计数为 0 |

---

## 4. channel

**channel** 是 goroutine 之间的通信管道：

```go
// 创建 channel
ch := make(chan int)

// 发送数据
go func() {
    ch <- 42  // 发送 42 到 channel
}()

// 接收数据
value := <-ch  // 从 channel 接收数据
fmt.Println(value)  // 42
```

### 无缓冲 vs 有缓冲 channel

```go
// 无缓冲 channel（同步）
ch := make(chan int)  // 发送和接收会阻塞直到双方就绪

// 有缓冲 channel（异步）
ch := make(chan int, 10)  // 缓冲区大小为 10
```

### 关闭 channel

```go
ch := make(chan int)

go func() {
    for i := 0; i < 5; i++ {
        ch <- i
    }
    close(ch)  // 关闭 channel
}()

// 遍历 channel
for v := range ch {
    fmt.Println(v)  // 0, 1, 2, 3, 4
}
```

---

<!-- section:end:08-01 -->

---

<!-- section:start:08-02 -->

## 5. channel 的高级用法

### 单向 channel

```go
func producer(ch chan<- int) {  // 只能发送
    for i := 0; i < 5; i++ {
        ch <- i
    }
    close(ch)
}

func consumer(ch <-chan int) {  // 只能接收
    for v := range ch {
        fmt.Println(v)
    }
}

func main() {
    ch := make(chan int)
    go producer(ch)
    consumer(ch)
}
```

### 带超时的接收

```go
ch := make(chan int)

select {
case v := <-ch:
    fmt.Println("收到:", v)
case <-time.After(time.Second):
    fmt.Println("超时了")
}
```

### 多路复用

```go
ch1 := make(chan string)
ch2 := make(chan string)

go func() {
    time.Sleep(time.Second)
    ch1 <- "来自 ch1"
}()

go func() {
    time.Sleep(2 * time.Second)
    ch2 <- "来自 ch2"
}()

for i := 0; i < 2; i++ {
    select {
    case msg1 := <-ch1:
        fmt.Println(msg1)
    case msg2 := <-ch2:
        fmt.Println(msg2)
    }
}
```

---

## 6. select 语句

`select` 用于同时等待多个 channel 操作：

```go
select {
case <-ch1:
    // ch1 有数据
case ch2 <- value:
    // 成功发送到 ch2
case <-time.After(time.Second):
    // 超时
default:
    // 所有 case 都不满足
}
```

### 非阻塞发送/接收

```go
ch := make(chan int, 1)

// 非阻塞发送
select {
case ch <- 42:
    fmt.Println("发送成功")
default:
    fmt.Println("channel 已满")
}

// 非阻塞接收
select {
case v := <-ch:
    fmt.Println("收到:", v)
default:
    fmt.Println("channel 为空")
}
```

---

## 7. 并发安全

### 竞态条件

当多个 goroutine 同时访问共享变量时会发生竞态条件：

```go
var counter int

func increment() {
    for i := 0; i < 1000; i++ {
        counter++  // 不是原子操作！
    }
}

func main() {
    var wg sync.WaitGroup
    wg.Add(2)
    
    go func() {
        defer wg.Done()
        increment()
    }()
    
    go func() {
        defer wg.Done()
        increment()
    }()
    
    wg.Wait()
    fmt.Println("counter =", counter)  // 可能不是 2000！
}
```

### 使用 mutex 保护共享变量

```go
var (
    counter int
    mu      sync.Mutex
)

func increment() {
    for i := 0; i < 1000; i++ {
        mu.Lock()   // 加锁
        counter++
        mu.Unlock() // 解锁
    }
}
```

### sync.RWMutex

读多写少场景使用 `RWMutex`：

```go
var (
    data   map[string]string
    rwMu   sync.RWMutex
)

func read(key string) string {
    rwMu.RLock()   // 读锁（多个 goroutine 可以同时读）
    defer rwMu.RUnlock()
    return data[key]
}

func write(key, value string) {
    rwMu.Lock()    // 写锁（互斥）
    defer rwMu.Unlock()
    data[key] = value
}
```

---

<!-- section:end:08-02 -->

---

<!-- section:start:08-03 -->

## 8. 并发模式

### Worker Pool 模式

```go
func worker(id int, jobs <-chan int, results chan<- int) {
    for job := range jobs {
        fmt.Printf("worker %d 处理 job %d\n", id, job)
        results <- job * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    
    // 启动 3 个 worker
    for w := 1; w <= 3; w++ {
        go worker(w, jobs, results)
    }
    
    // 发送 9 个 job
    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs)
    
    // 收集结果
    for a := 1; a <= 9; a++ {
        <-results
    }
}
```

### Fan-Out / Fan-In 模式

```go
func generator(nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        for _, n := range nums {
            out <- n
        }
        close(out)
    }()
    return out
}

func square(in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        for n := range in {
            out <- n * n
        }
        close(out)
    }()
    return out
}

func merge(cs ...<-chan int) <-chan int {
    var wg sync.WaitGroup
    out := make(chan int)
    
    wg.Add(len(cs))
    for _, c := range cs {
        go func(ch <-chan int) {
            defer wg.Done()
            for n := range ch {
                out <- n
            }
        }(c)
    }
    
    go func() {
        wg.Wait()
        close(out)
    }()
    return out
}

func main() {
    in := generator(1, 2, 3, 4)
    
    // Fan-Out：多个 square
    c1 := square(in)
    c2 := square(in)
    
    // Fan-In：合并结果
    for n := range merge(c1, c2) {
        fmt.Println(n)
    }
}
```

---

## 9. context

`context` 用于在 goroutine 之间传递取消信号和超时：

```go
func doWork(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            fmt.Println("工作被取消")
            return
        default:
            fmt.Println("工作中...")
            time.Sleep(500 * time.Millisecond)
        }
    }
}

func main() {
    // 创建带超时的 context
    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()  // 确保释放资源
    
    go doWork(ctx)
    
    time.Sleep(3 * time.Second)
}
```

### context 类型

| 函数 | 用途 |
|------|------|
| `context.Background()` | 根 context |
| `context.WithCancel()` | 可取消的 context |
| `context.WithTimeout()` | 带超时的 context |
| `context.WithDeadline()` | 带截止时间的 context |
| `context.WithValue()` | 传递值 |

---

## 10. 常见错误（新手必看）

| 错误信息 | 原因 | 解决办法 |
|----------|------|----------|
| `fatal error: all goroutines are asleep - deadlock!` | channel 发送/接收时没有对应的另一端 | 检查 channel 是否正确关闭或配对 |
| `send on closed channel` | 向已关闭的 channel 发送数据 | 检查 channel 状态 |
| `race condition` | 并发访问共享变量 | 使用 mutex 或 channel |
| `goroutine leak` | goroutine 没有退出条件 | 使用 context 或 channel 控制生命周期 |

---

<!-- section:end:08-03 -->

---

## 11. 本章小结

| 概念 | 要点 |
|------|------|
| **goroutine** | 轻量级线程，用 `go` 启动 |
| **channel** | 通信管道，`make(chan T)` |
| 无缓冲 channel | 同步通信，发送和接收互相阻塞 |
| 有缓冲 channel | 异步通信，缓冲区满时阻塞 |
| **select** | 多路复用，同时等待多个 channel |
| **sync.WaitGroup** | 等待多个 goroutine 完成 |
| **sync.Mutex** | 互斥锁，保护共享变量 |
| **sync.RWMutex** | 读写锁，读多写少场景 |
| **context** | 传递取消信号和超时 |
| **Worker Pool** | 固定数量的 worker 处理任务 |