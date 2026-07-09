# 安装与第一个程序

> 本章目标：理解 Go 程序的基本结构，写出并运行你的第一行 Go 代码。  
> **好消息**：在本站学习时，你**不需要**在电脑上安装 Go——浏览器里就能跑。

---

<!-- section:start:01-01 -->

## 1. Go 程序长什么样？

每个 Go 程序都由下面几块组成，先有个整体印象：

```go
package main          // ① 声明包名

import "fmt"        // ② 导入要用的标准库

func main() {        // ③ 程序入口函数
    fmt.Println("Hello, Go!")  // ④ 具体要执行的代码
}
```

| 部分 | 作用 | 类比 |
|------|------|------|
| `package main` | 告诉编译器「这是可独立运行的程序」 | 一本书的封面 |
| `import "fmt"` | 引入格式化输入输出库 | 打开工具箱 |
| `func main()` | 程序从这里开始执行 | 按播放键 |
| `fmt.Println(...)` | 在屏幕上打印一行文字 | 让程序「说话」 |

下面逐行细讲。

---

## 2. `package main` — 包是什么？

Go 用 **包（package）** 组织代码。你可以把包理解为一个文件夹里的代码集合。

- 名字叫 **`main`** 的包，表示这是一个**可执行程序**（能直接 `go run`）
- 其他名字的包（如 `utils`、`http`）一般是**库**，给别人 `import` 用

```go
package main  // 必须有这一行，且可执行程序必须是 package main
```

> **小白提示**：初学阶段，你写的每个练习文件都用 `package main` 就行。

---

## 3. `import` — 使用标准库

Go 自带大量**标准库**，不用额外安装。`fmt` 是最常用的之一，负责**格式化输入输出**（format 的缩写）。

```go
import "fmt"
```

导入后，用 `fmt.` 前缀调用里面的函数：

```go
fmt.Println("你好")   // 打印并换行
fmt.Print("不换行")    // 打印但不自动换行
```

也可以一次导入多个包：

```go
import (
    "fmt"
    "strings"
)
```

---

## 4. `func main()` — 程序入口

`func` 是定义**函数**的关键字。`main` 是特殊函数名——**程序启动时自动调用它**。

```go
func main() {
    // 你的代码写在这里
}
```

规则：

- 可执行程序**必须有且只有一个** `func main()`
- `main` 前面的 `func` 不能省
- 花括号 `{` 在 Go 里**必须和函数名同一行**（这是语法规定，不是风格问题）

---

## 5. `fmt.Println` — 让程序开口说话

`Println` = **Print** + **ln**（line），意思是「打印一行，然后换行」。

```go
fmt.Println("Hello, Go!")
fmt.Println("第二行")
```

输出：

```
Hello, Go!
第二行
```

<!-- section:end:01-01 -->

---

<!-- section:start:01-02 -->

### 字符串用双引号

Go 里文字（字符串）用 **英文双引号** `"` 包起来：

```go
fmt.Println("Hello, Go!")  // ✅ 正确
fmt.Println('Hello')       // ❌ 错误：单引号在 Go 里表示字符（rune），不是字符串
```

### 注意大小写

Go **区分大小写**：

```go
fmt.Println("Hello, Go!")  // ✅
Fmt.Println("Hello")       // ❌ Fmt 和 fmt 不是同一个东西
```

---

## 6. 注释 — 给人看的说明

注释不会被执行，用来解释代码：

```go
// 这是单行注释

/*
这是多行注释
可以写好几行
*/
```

建议：遇到不好理解的逻辑，用中文写一行注释——**半年后的你会感谢现在的自己**。

---

## 7. 完整示例：拆解每一行

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
```

执行流程：

1. Go 找到 `package main`
2. 加载 `fmt` 包
3. 进入 `func main()`
4. 调用 `fmt.Println`，在标准输出打印 `Hello, Go!` 并换行
5. `main` 结束，程序退出

---

## 8. 在本站怎么运行代码？

1. 读完本教程后，点击下方 **「开始练习」**
2. 在右侧编辑器里写代码（或修改模板）
3. 点 **▶ 运行** — 看输出是否符合预期
4. 点 **提交判分** — 系统自动检查，通过则解锁下一题

这和本地用 `go run main.go` 效果一样，只是环境在服务器上。

---

## 9. 本地安装 Go（可选）

学完前几章后，建议在电脑上安装 Go，方便做自己的小项目：

1. 打开 [https://go.dev/dl/](https://go.dev/dl/)
2. 下载 Windows / macOS / Linux 安装包
3. 安装后打开终端，输入：

```bash
go version
```

看到类似 `go version go1.22 linux/amd64` 就成功了。

创建并运行第一个程序：

```bash
mkdir hello && cd hello
go mod init example/hello
```

创建 `main.go`（内容和上面一样），然后：

```bash
go run .
```

---

## 10. 常见错误（新手必看）

| 错误信息 | 原因 | 解决办法 |
|----------|------|----------|
| `expected 'package', found ...` | 第一行不是 `package main` | 文件开头写 `package main` |
| `imported and not used: "fmt"` | 导入了 fmt 但没用到 | 删掉 import 或加上 `fmt.Println` |
| `undefined: fmt` | 忘了 import fmt | 加上 `import "fmt"` |
| `syntax error: unexpected ...` | 括号、引号没配对 | 检查每行双引号、花括号是否成对 |

---

<!-- section:end:01-02 -->

## 11. 本章小结

| 概念 | 记住这一句 |
|------|------------|
| `package main` | 可执行程序的标志 |
| `import "fmt"` | 使用标准库里的 fmt |
| `func main()` | 程序从这里开始 |
| `fmt.Println()` | 打印一行文字 |
| `//` | 单行注释 |

---

## 开始练习

下面有 **2 道练习题**，帮你巩固：

1. **Hello, Go!** — 打印 `Hello, Go!`
2. **打印你的名字** — 打印 `My name is Go learner`

建议先**不看提示**自己写，卡住了再点「显示提示」。

👉 准备好了吗？从第一题开始吧！
