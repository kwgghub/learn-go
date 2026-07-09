package main

import (
	"log"
	"net/http"
	"os"

	"learn-go/backend/internal/content"
	"learn-go/backend/internal/handler"
)

func main() {
	contentPath := content.ResolveContentPath()
	store, err := content.NewStore(contentPath)
	if err != nil {
		log.Fatalf("加载课程内容失败: %v", err)
	}

	mux := http.NewServeMux()
	api := handler.New(store)
	api.Register(mux)

	addr := envOr("ADDR", ":8080")
	log.Printf("learn-go API 运行于 http://localhost%s", addr)
	log.Printf("课程内容: %s", contentPath)
	if err := http.ListenAndServe(addr, handler.CORS(mux)); err != nil {
		log.Fatal(err)
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
