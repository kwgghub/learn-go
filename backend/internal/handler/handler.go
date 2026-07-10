package handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"learn-go/backend/internal/content"
	"learn-go/backend/internal/runner"
)

type API struct {
	store   *content.Store
	timeout time.Duration
}

func New(store *content.Store) *API {
	return &API{store: store, timeout: 30 * time.Second}
}

func (a *API) Register(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/health", a.health)
	mux.HandleFunc("GET /api/catalog", a.catalog)
	mux.HandleFunc("GET /api/chapters/{slug}", a.chapter)
	mux.HandleFunc("POST /api/run", a.run)
	mux.HandleFunc("POST /api/submit", a.submit)
}

func (a *API) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a *API) catalog(w http.ResponseWriter, r *http.Request) {
	catalog := a.store.Catalog()
	public := struct {
		Sections []content.Section `json:"sections"`
		Chapters []chapterSummary  `json:"chapters"`
	}{
		Sections: catalog.Sections,
		Chapters: make([]chapterSummary, 0, len(catalog.Chapters)),
	}
	for _, ch := range catalog.Chapters {
		ids := make([]string, 0, len(ch.ExerciseList))
		for _, ex := range ch.ExerciseList {
			ids = append(ids, ex.ID)
		}
		for _, section := range ch.Sections {
			for _, ex := range section.ExerciseList {
				ids = append(ids, ex.ID)
			}
		}
		public.Chapters = append(public.Chapters, chapterSummary{
			ID:          ch.ID,
			Slug:        ch.Slug,
			Title:       ch.Title,
			Summary:     ch.Summary,
			Type:        ch.Type,
			Minutes:     ch.Minutes,
			Exercises:   ch.Exercises,
			Section:     ch.Section,
			ExerciseIDs: ids,
		})
	}
	writeJSON(w, http.StatusOK, public)
}

func (a *API) chapter(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	ch, ok := a.store.ChapterBySlug(slug)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "章节不存在"})
		return
	}
	if ch.Type == "coding" {
		safe := ch
		for i := range safe.ExerciseList {
			safe.ExerciseList[i].Solution = ""
		}
		writeJSON(w, http.StatusOK, safe)
		return
	}
	writeJSON(w, http.StatusOK, ch)
}

type runRequest struct {
	Code string `json:"code"`
}

type submitRequest struct {
	ChapterSlug string `json:"chapterSlug"`
	ExerciseID  string `json:"exerciseId"`
	Code        string `json:"code"`
}

type chapterSummary struct {
	ID          string   `json:"id"`
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Summary     string   `json:"summary"`
	Type        string   `json:"type"`
	Minutes     int      `json:"minutes"`
	Exercises   int      `json:"exercises"`
	Section     string   `json:"section"`
	ExerciseIDs []string `json:"exerciseIds"`
}

func (a *API) run(w http.ResponseWriter, r *http.Request) {
	var req runRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "无效请求"})
		return
	}
	if strings.TrimSpace(req.Code) == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "代码不能为空"})
		return
	}
	result := runner.RunGo(req.Code, a.timeout)
	writeJSON(w, http.StatusOK, result)
}

func (a *API) submit(w http.ResponseWriter, r *http.Request) {
	var req submitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "无效请求"})
		return
	}
	_, ex, ok := a.store.Exercise(req.ChapterSlug, req.ExerciseID)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "题目不存在"})
		return
	}
	if len(ex.Tests) == 0 {
		writeJSON(w, http.StatusOK, runner.Validation{Passed: true, Message: "本题为阅读题，已标记完成"})
		return
	}

	for _, tc := range ex.Tests {
		switch tc.Type {
		case "stdout":
			v := runner.ValidateStdout(req.Code, tc.Expected, a.timeout)
			if !v.Passed {
				writeJSON(w, http.StatusOK, v)
				return
			}
		default:
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "不支持的测试类型"})
			return
		}
	}

	writeJSON(w, http.StatusOK, runner.Validation{Passed: true, Message: "通过！做得好 🎉"})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
