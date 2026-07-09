# Go 测试

> 本章目标：学会写单元测试和表格驱动测试，理解测试驱动开发（TDD）的思想。  
> 测试是保证代码质量的关键——每写一个函数，都要写对应的测试。

---

<!-- section:start:11-01 -->

## 1. 为什么需要测试？

### 没有测试的问题

想象一下：你写了一个计算函数，测试了几个例子觉得没问题。但别人调用时传入了边界值，程序崩溃了。

```go
func Divide(a, b int) int {
    return a / b
}

// 如果 b = 0，会 panic！
```

### 测试的好处

1. **防回归**：修改代码后，运行测试确保没破坏原有功能
2. **文档**：测试用例本身就是文档，说明函数怎么用
3. **快速反馈**：自动运行，几秒钟知道结果
4. **重构信心**：有测试覆盖，重构代码更放心

---

## 2. Go 的测试基础

### 测试文件命名

测试文件以 `_test.go` 结尾：

```
math.go        // 源代码
math_test.go   // 测试文件
```

### 测试函数签名

测试函数以 `Test` 开头，接收 `*testing.T` 参数：

```go
func TestDivide(t *testing.T) {
    // 测试代码
}
```

### 运行测试

```bash
# 运行当前包的所有测试
go test

# 运行指定测试
go test -run TestDivide

# 显示详细输出
go test -v

# 运行所有包的测试
go test ./...
```

---

## 3. 第一个测试

```go
// math.go
package math

func Add(a, b int) int {
    return a + b
}

func Divide(a, b int) int {
    return a / b
}
```

```go
// math_test.go
package math

import "testing"

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    expected := 5
    
    if result != expected {
        t.Errorf("Add(2, 3) = %d; want %d", result, expected)
    }
}

func TestDivide(t *testing.T) {
    result := Divide(10, 2)
    expected := 5
    
    if result != expected {
        t.Errorf("Divide(10, 2) = %d; want %d", result, expected)
    }
}
```

运行测试：

```bash
go test -v
=== RUN   TestAdd
--- PASS: TestAdd (0.00s)
=== RUN   TestDivide
--- PASS: TestDivide (0.00s)
PASS
ok      example/math   0.001s
```

---

## 4. 表格驱动测试

当有多个测试用例时，用表格驱动测试更清晰：

```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive numbers", 2, 3, 5},
        {"negative numbers", -2, -3, -5},
        {"zero", 0, 0, 0},
        {"mixed", -2, 3, 1},
        {"large numbers", 100, 200, 300},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d; want %d", tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

运行结果：

```bash
go test -v
=== RUN   TestAdd
=== RUN   TestAdd/positive_numbers
=== RUN   TestAdd/negative_numbers
=== RUN   TestAdd/zero
=== RUN   TestAdd/mixed
=== RUN   TestAdd/large_numbers
--- PASS: TestAdd (0.00s)
PASS
```

---

## 5. 测试覆盖率

```bash
# 查看测试覆盖率
go test -cover

# 生成覆盖率报告
go test -coverprofile=coverage.out
go tool cover -html=coverage.out
```

---

<!-- section:end:11-01 -->

---

<!-- section:start:11-02 -->

## 6. 错误处理测试

```go
func SafeDivide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

func TestSafeDivide(t *testing.T) {
    tests := []struct {
        name      string
        a, b      int
        expected  int
        expectErr bool
    }{
        {"normal", 10, 2, 5, false},
        {"zero divisor", 10, 0, 0, true},
        {"negative divisor", 10, -2, -5, false},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result, err := SafeDivide(tt.a, tt.b)
            
            if tt.expectErr {
                if err == nil {
                    t.Error("expected error, got nil")
                }
                return
            }
            
            if err != nil {
                t.Errorf("unexpected error: %v", err)
                return
            }
            
            if result != tt.expected {
                t.Errorf("SafeDivide(%d, %d) = %d; want %d", tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

---

## 7. Benchmark 测试

测试函数性能：

```go
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(2, 3)
    }
}
```

运行：

```bash
go test -bench=.
go test -bench=BenchmarkAdd -benchmem  # 显示内存分配
```

---

## 8. 子测试与并行测试

```go
func TestParallel(t *testing.T) {
    t.Run("test1", func(t *testing.T) {
        t.Parallel()
        // 测试代码
    })
    
    t.Run("test2", func(t *testing.T) {
        t.Parallel()
        // 测试代码
    })
}
```

---

## 9. 完整示例

```go
package main

import (
    "errors"
    "fmt"
)

func CalculateBMI(weight, height float64) (float64, error) {
    if height <= 0 {
        return 0, errors.New("height must be positive")
    }
    if weight <= 0 {
        return 0, errors.New("weight must be positive")
    }
    return weight / (height * height), nil
}

func GetBMICategory(bmi float64) string {
    switch {
    case bmi < 18.5:
        return "偏瘦"
    case bmi < 24:
        return "正常"
    case bmi < 28:
        return "超重"
    default:
        return "肥胖"
    }
}

func main() {
    bmi, err := CalculateBMI(65, 1.75)
    if err != nil {
        fmt.Println("计算失败:", err)
        return
    }
    fmt.Printf("BMI: %.2f，分类: %s\n", bmi, GetBMICategory(bmi))
}
```

测试文件：

```go
package main

import "testing"

func TestCalculateBMI(t *testing.T) {
    tests := []struct {
        name      string
        weight    float64
        height    float64
        expected  float64
        expectErr bool
    }{
        {"normal", 65, 1.75, 21.22, false},
        {"underweight", 45, 1.75, 14.69, false},
        {"overweight", 80, 1.75, 26.12, false},
        {"obese", 100, 1.75, 32.65, false},
        {"zero height", 65, 0, 0, true},
        {"negative weight", -65, 1.75, 0, true},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result, err := CalculateBMI(tt.weight, tt.height)
            
            if tt.expectErr {
                if err == nil {
                    t.Error("expected error, got nil")
                }
                return
            }
            
            if err != nil {
                t.Errorf("unexpected error: %v", err)
                return
            }
            
            if result != tt.expected {
                t.Errorf("CalculateBMI(%f, %f) = %f; want %f", tt.weight, tt.height, result, tt.expected)
            }
        })
    }
}

func TestGetBMICategory(t *testing.T) {
    tests := []struct {
        name     string
        bmi      float64
        expected string
    }{
        {"underweight", 18.0, "偏瘦"},
        {"normal", 22.0, "正常"},
        {"overweight", 25.0, "超重"},
        {"obese", 30.0, "肥胖"},
    }
    
    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := GetBMICategory(tt.bmi)
            if result != tt.expected {
                t.Errorf("GetBMICategory(%f) = %s; want %s", tt.bmi, result, tt.expected)
            }
        })
    }
}
```

---

## 10. 常见错误（新手必看）

| 错误信息 | 原因 | 解决办法 |
|----------|------|----------|
| `undefined: t` | 测试函数签名错误 | 使用 `func TestName(t *testing.T)` |
| `package xxx_test` | 包名错误 | 应该和源代码包名一致 |
| `test file xxx_test.go is in package xxx` | 测试文件和源代码在同一包 | 这是正确的，保持一致 |
| `no test files` | 没有找到测试文件 | 确保文件名以 `_test.go` 结尾 |
| `test failed` | 测试断言失败 | 检查期望值和实际值是否匹配 |

<!-- section:end:11-02 -->

---

## 11. 本章小结

| 概念 | 要点 |
|------|------|
| **测试文件** | `xxx_test.go` |
| **测试函数** | `func TestXxx(t *testing.T)` |
| **表格驱动测试** | 用 slice 存储多个测试用例 |
| **子测试** | `t.Run(name, func(t *testing.T))` |
| **并行测试** | `t.Parallel()` |
| **Benchmark** | `func BenchmarkXxx(b *testing.B)` |
| **覆盖率** | `go test -cover` |
| **运行测试** | `go test` / `go test ./...` |