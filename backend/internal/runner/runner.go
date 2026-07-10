package runner

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

const maxOutputBytes = 64 * 1024

type Result struct {
	Stdout   string `json:"stdout"`
	Stderr   string `json:"stderr"`
	ExitCode int    `json:"exitCode"`
	Duration int64  `json:"durationMs"`
	Error    string `json:"error,omitempty"`
}

type Validation struct {
	Passed   bool   `json:"passed"`
	Message  string `json:"message"`
	Stdout   string `json:"stdout,omitempty"`
	Stderr   string `json:"stderr,omitempty"`
	Expected string `json:"expected,omitempty"`
}

func RunGo(code string, timeout time.Duration) Result {
	start := time.Now()
	dir, err := os.MkdirTemp("", "learngo-run-*")
	if err != nil {
		return Result{Error: err.Error(), Duration: time.Since(start).Milliseconds()}
	}
	defer os.RemoveAll(dir)

	mainPath := filepath.Join(dir, "main.go")
	if err := os.WriteFile(mainPath, []byte(code), 0o644); err != nil {
		return Result{Error: err.Error(), Duration: time.Since(start).Milliseconds()}
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	binPath := filepath.Join(dir, "app")
	buildCmd := exec.CommandContext(ctx, "go", "build", "-o", binPath, mainPath)
	buildCmd.Dir = dir
	var buildStderr bytes.Buffer
	buildCmd.Stderr = &buildStderr

	if err := buildCmd.Run(); err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return Result{
				Stderr:   trimOutput(buildStderr.String()),
				ExitCode: -1,
				Duration: time.Since(start).Milliseconds(),
				Error:    fmt.Sprintf("编译超时（%s）", timeout),
			}
		}
		return Result{
			Stderr:   trimOutput(buildStderr.String()),
			ExitCode: 1,
			Duration: time.Since(start).Milliseconds(),
			Error:    errorMessage(err),
		}
	}

	runCmd := exec.CommandContext(ctx, binPath)
	runCmd.Dir = dir
	var stdout, stderr bytes.Buffer
	runCmd.Stdout = &stdout
	runCmd.Stderr = &stderr

	runErr := runCmd.Run()
	exitCode := 0
	if runErr != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return Result{
				Stdout:   trimOutput(stdout.String()),
				Stderr:   trimOutput(stderr.String()),
				ExitCode: -1,
				Duration: time.Since(start).Milliseconds(),
				Error:    fmt.Sprintf("运行超时（%s）", timeout),
			}
		}
		if exitErr, ok := runErr.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			exitCode = 1
		}
	}

	return Result{
		Stdout:   trimOutput(stdout.String()),
		Stderr:   trimOutput(stderr.String()),
		ExitCode: exitCode,
		Duration: time.Since(start).Milliseconds(),
		Error:    errorMessage(runErr),
	}
}

func ValidateStdout(code, expected string, timeout time.Duration) Validation {
	result := RunGo(code, timeout)
	if result.Error != "" && result.ExitCode != 0 {
		msg := result.Error
		if result.Stderr != "" {
			msg = result.Stderr
		}
		return Validation{
			Passed:   false,
			Message:  msg,
			Stdout:   result.Stdout,
			Stderr:   result.Stderr,
			Expected: expected,
		}
	}

	actual := normalizeOutput(result.Stdout)
	want := normalizeOutput(expected)
	if actual == want {
		return Validation{
			Passed:  true,
			Message: "通过！做得好 🎉",
			Stdout:  result.Stdout,
		}
	}

	return Validation{
		Passed:   false,
		Message:  fmt.Sprintf("输出不匹配。\n期望：%q\n实际：%q", want, actual),
		Stdout:   result.Stdout,
		Stderr:   result.Stderr,
		Expected: expected,
	}
}

func normalizeOutput(s string) string {
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, "\r\n", "\n")
	lines := strings.Split(s, "\n")
	var filtered []string
	for _, line := range lines {
		line = strings.TrimRight(line, " ")
		if line != "" {
			filtered = append(filtered, line)
		}
	}
	return strings.Join(filtered, "\n")
}

func trimOutput(s string) string {
	if len(s) <= maxOutputBytes {
		return s
	}
	return s[:maxOutputBytes] + "\n...(输出已截断)"
}

func errorMessage(err error) string {
	if err == nil {
		return ""
	}
	return err.Error()
}
