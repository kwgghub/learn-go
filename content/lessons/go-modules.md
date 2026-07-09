# Go Modules 与项目结构

> 本章目标：了解现代 Go 项目如何管理依赖和目录，为本地开发做准备。  
> 本章以**概念阅读**为主，无编程练习——但它是从「刷题」走向「做项目」的桥梁。

---

## 1. 为什么需要 Go Modules？

### 早期的 GOPATH 问题

早期 Go 用 `GOPATH`，所有项目扔在一个大文件夹里：

```
GOPATH/
├── src/
│   ├── github.com/
│   │   └── yourname/
│   │       └── project1/
│   └── gitlab.com/
│       └── company/
│           └── project2/
```

**问题**：
- 所有项目必须放在固定目录
- 无法同时使用同一库的不同版本
- 依赖管理混乱

### Go Modules 带来的改变

**Go Modules**（Go 1.11+，1.16 成为默认）用 `go.mod` 文件管理：

- 项目叫什么名字（模块路径）
- 依赖哪些第三方库、什么版本
- 本项目用 Go 哪个版本

现在**所有新项目都应该用 Modules**。

---

## 2. 创建模块：`go mod init`

在项目根目录执行：

```bash
go mod init github.com/你的用户名/项目名
```

会生成 `go.mod`：

```go
module github.com/yourname/myapp

go 1.22
```

### 模块路径怎么选？

模块路径通常用 **Git 仓库地址**，方便别人 `go get` 你的库：

```bash
go mod init github.com/alice/hello-world
go mod init gitlab.com/bob/my-service
go mod init gitee.com/carol/awesome-tool
```

本地练习可以用简单名字：

```bash
go mod init example/hello
go mod init myapp
```

---

## 3. `go.mod` 文件详解

```go
module example.com/myapp

go 1.22

require (
    github.com/gin-gonic/gin v1.9.1
    github.com/stretchr/testify v1.8.4
)

require indirect (
    github.com/go-playground/validator/v10 v10.15.0
)
```

| 部分 | 含义 |
|------|------|
| `module` | 模块路径，import 时的前缀 |
| `go` | 最低 Go 版本 |
| `require` | 直接依赖及版本 |
| `require indirect` | 间接依赖（被直接依赖依赖的库） |

### `go.sum` 文件

还有 `go.sum`（依赖校验和），**要提交到 Git**，不要删。它记录了每个依赖的哈希值，确保构建时依赖没有被篡改。

---

## 4. 常用命令

| 命令 | 作用 | 示例 |
|------|------|------|
| `go mod init` | 初始化模块 | `go mod init example/hello` |
| `go mod tidy` | 添加缺失依赖、删除没用到的 | `go mod tidy` |
| `go get pkg@version` | 添加/升级依赖 | `go get github.com/gin-gonic/gin@v1.9.0` |
| `go build` | 编译当前模块 | `go build` |
| `go run .` | 编译并运行 | `go run .` |
| `go test ./...` | 运行所有测试 | `go test ./...` |
| `go fmt ./...` | 格式化代码 | `go fmt ./...` |
| `go vet ./...` | 静态检查常见问题 | `go vet ./...` |
| `go list -m all` | 列出所有依赖 | `go list -m all` |
| `go mod download` | 下载所有依赖到本地缓存 | `go mod download` |

**养成习惯**：改完依赖跑 `go mod tidy`。

---

## 5. 推荐项目目录结构

### 小型项目（一个文件）

```
myapp/
├── go.mod
├── go.sum
└── main.go
```

### 稍大项目（标准布局）

推荐 **Standard Go Project Layout** 的简化版：

```
myapp/
├── go.mod
├── go.sum
├── cmd/
│   └── myapp/
│       └── main.go          # 程序入口（可执行文件）
├── internal/
│   ├── handler/             # HTTP 处理（仅本项目用）
│   ├── service/             # 业务逻辑
│   └── repository/          # 数据访问
├── pkg/
│   └── utils/               # 可被外部 import 的库
├── api/
│   └── handlers.go          # API 定义
├── config/
│   └── config.go            # 配置文件
├── tests/
│   └── integration_test.go  # 集成测试
└── README.md
```

### 目录职责说明

| 目录 | 含义 | 是否可以被外部 import |
|------|------|----------------------|
| `cmd/xxx/` | 可执行程序的 main 包，每个子目录一个命令 | - |
| `internal/` | 私有代码，**别的项目不能 import** | ❌ 不能 |
| `pkg/` | 希望给别人用的库代码 | ✅ 可以 |
| `api/` | API 定义、接口文档 | ✅ 可以 |
| `config/` | 配置文件、配置加载 | - |
| `tests/` | 测试文件 | - |

### 初学者建议

初学：一个 `main.go` 就够；做项目时再拆分。

---

## 6. `import` 与模块路径

模块是 `example.com/myapp` 时：

```go
import "example.com/myapp/internal/service"
import "example.com/myapp/pkg/utils"
```

标准库不需要模块前缀：

```go
import "fmt"
import "net/http"
import "encoding/json"
```

第三方库：

```go
import "github.com/gin-gonic/gin"
import "github.com/stretchr/testify/assert"
```

### 相对导入 vs 绝对导入

Go **不支持**相对导入（如 `./utils`），必须用完整路径：

```go
// ❌ 不支持
import "./utils"

// ✅ 正确
import "example.com/myapp/pkg/utils"
```

---

## 7. 从写单文件到写项目

| 阶段 | 做法 | 示例 |
|------|------|------|
| 本站刷题 | 单文件 `package main`，不用 go.mod | `main.go` |
| 第一个本地项目 | `go mod init`，一个 main.go | `go mod init example/hello` |
| 小工具 | 加 `internal/`，拆函数 | `internal/utils/helper.go` |
| 对外提供库 | 代码放 `pkg/`，README 写用法 | `pkg/mylib/mylib.go` |
| 大型项目 | 完整标准布局 | `cmd/`, `internal/`, `pkg/` |

---

## 8. 版本与兼容性

### Go 版本管理

- `go 1.22` in go.mod 表示需要 Go 1.22+
- Go **承诺 1.x 向后兼容**：用 1.22 写的代码，1.23 编译器一般能直接编译
- 升级 Go 版本后跑一遍 `go test ./...`

### 依赖版本管理

```bash
# 添加依赖（最新版本）
go get github.com/gin-gonic/gin

# 添加指定版本
go get github.com/gin-gonic/gin@v1.9.0

# 升级到最新版本
go get github.com/gin-gonic/gin@latest

# 降级版本
go get github.com/gin-gonic/gin@v1.8.0

# 删除依赖（先删除 import，再 run go mod tidy）
go mod tidy
```

### 版本号规则

Go Modules 遵循 **Semantic Versioning**（语义化版本）：

| 版本号 | 含义 |
|--------|------|
| `v1.0.0` | 第一个稳定版本 |
| `v1.0.1` | Bug 修复 |
| `v1.1.0` | 新增功能（向后兼容） |
| `v2.0.0` | 不向后兼容的重大变更 |

---

## 9. 和本站学习的关系

| 环境 | 说明 | 是否需要 go.mod |
|------|------|----------------|
| 本站浏览器 | 单文件运行，隐藏了 go.mod | ❌ 不需要 |
| 本地开发 | 必须 `go mod init`，才能拉依赖、分目录 | ✅ 必须 |

学完基础章后，**强烈建议**本地装 Go，用 Modules 做一个小项目（如：命令行 Todo、HTTP Hello World）。

---

## 10. 实战：5 分钟搭一个本地项目

### 步骤 1：创建项目目录

```bash
mkdir hello-mod && cd hello-mod
```

### 步骤 2：初始化模块

```bash
go mod init example/hello-mod
```

### 步骤 3：创建 main.go

```go
package main

import "fmt"

func main() {
    fmt.Println("My first Go module!")
}
```

### 步骤 4：运行

```bash
go run .
```

输出：
```
My first Go module!
```

### 步骤 5：添加依赖

```bash
go get github.com/google/uuid
```

修改 main.go：

```go
package main

import (
    "fmt"
    "github.com/google/uuid"
)

func main() {
    fmt.Println("My first Go module!")
    fmt.Println("生成的 UUID:", uuid.New().String())
}
```

运行：

```bash
go run .
```

输出：
```
My first Go module!
生成的 UUID: 1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed
```

---

## 11. 实战：搭建 HTTP 服务

### 步骤 1：初始化模块

```bash
mkdir go-http-demo && cd go-http-demo
go mod init example/http-demo
```

### 步骤 2：安装 Gin

```bash
go get github.com/gin-gonic/gin@v1.9.0
```

### 步骤 3：创建目录结构

```
go-http-demo/
├── go.mod
├── go.sum
└── cmd/
    └── api/
        └── main.go
```

### 步骤 4：编写代码

```go
// cmd/api/main.go
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    
    r.GET("/", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Hello, Go!",
        })
    })
    
    r.GET("/users/:id", func(c *gin.Context) {
        id := c.Param("id")
        c.JSON(200, gin.H{
            "user_id": id,
        })
    })
    
    r.Run(":8080")
}
```

### 步骤 5：运行

```bash
go run ./cmd/api
```

### 步骤 6：测试

打开浏览器访问 `http://localhost:8080`：

```json
{"message": "Hello, Go!"}
```

访问 `http://localhost:8080/users/123`：

```json
{"user_id": "123"}
```

---

## 12. 常见坑

| 问题 | 原因 | 解决办法 |
|------|------|----------|
| `cannot find module` | 检查 go.mod 的 module 路径和 import 是否一致 | 修改 import 路径或 go.mod |
| `go: go.mod file not found` | 在项目根目录执行，或先 `go mod init` | cd 到项目根目录 |
| 删了 go.sum | `go mod tidy` 重新生成 | `go mod tidy` |
| 代码放错目录 | main 一般在 `cmd/xxx/main.go` 或根目录 | 调整目录结构 |
| `go: module ... not found` | 网络问题，或依赖不存在 | 检查网络，或确认包名正确 |
| `import cycle not allowed` | 包之间循环依赖 | 重构代码，消除循环依赖 |

### 新手最容易犯的 5 个错误

1. **忘了 `go mod init`**：
   ```bash
   go run main.go  # ❌ go: go.mod file not found
   go mod init example/myapp  # ✅
   ```

2. **import 路径不对**：
   ```go
   import "./utils"  # ❌ 不支持相对路径
   import "example/myapp/pkg/utils"  # ✅
   ```

3. **没跑 `go mod tidy`**：
   ```bash
   # 添加新依赖后
   go mod tidy  # ✅ 自动添加到 go.mod
   ```

4. **依赖版本冲突**：
   ```bash
   # 查看依赖树
   go list -m all
   # 升级或降级依赖
   go get pkg@version
   ```

5. **internal 目录被外部 import**：
   ```go
   // ❌ 别的项目不能 import internal
   import "example/myapp/internal/utils"
   // ✅ 如果要给别人用，放 pkg/
   import "example/myapp/pkg/utils"
   ```

---

## 13. 工具推荐

| 工具 | 用途 | 安装方式 |
|------|------|----------|
| `golangci-lint` | 多工具集成的 linter | `go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest` |
| `air` | 热重载开发服务器 | `go install github.com/cosmtrek/air@latest` |
| `gopls` | LSP 语言服务器（IDE 支持） | 随 Go 安装自带 |
| `gomodifytags` | 自动生成 struct tags | `go install github.com/fatih/gomodifytags@latest` |
| `delve` | 调试器 | `go install github.com/go-delve/delve/cmd/dlv@latest` |

---

## 14. 本章小结

| 概念 | 要点 |
|------|------|
| **Go Modules** | 用 `go.mod` 管理模块和依赖 |
| `go mod init` | 创建项目 |
| `go mod tidy` | 整理依赖（添加缺失、删除无用） |
| `go get pkg@version` | 添加/升级依赖 |
| 目录布局 | `cmd/` 入口，`internal/` 私有，`pkg/` 可导出 |
| import 路径 | 用完整模块路径，不用相对路径 |
| `go.sum` | 依赖校验和，要提交到 Git |
| 语义化版本 | `vX.Y.Z`，主版本不兼容时升级主版本号 |

---

## 学完之后

恭喜完成工程化入门！接下来可以：

- 本地用 `go mod init` 创建自己的项目
- 学习 **错误处理**、**HTTP 服务**、**测试**（可继续扩展本教程）
- 阅读 [Go 官方文档](https://go.dev/doc/) 和 [Effective Go](https://go.dev/doc/effective_go)
- 尝试做一个小项目：命令行 Todo、HTTP API、CLI 工具

建议学习路径：
1. 在本地创建一个命令行工具（如计算器）
2. 尝试写一个 HTTP 服务（用 Gin 或标准库 `net/http`）
3. 学习 Go 测试（`go test`）
4. 了解并发（goroutine 和 channel）
