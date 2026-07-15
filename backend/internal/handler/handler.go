package handler

import (
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"learn-go/backend/internal/content"
	"learn-go/backend/internal/runner"
)

type API struct {
	store   *content.Store
	timeout time.Duration
}

func New(store *content.Store) *API {
	return &API{store: store, timeout: 60 * time.Second}
}

func (a *API) Register(r *gin.Engine) {
	r.GET("/api/health", a.health)
	r.GET("/api/catalog", a.catalog)
	r.GET("/api/chapters/:slug", a.chapter)
	r.POST("/api/run", a.run)
	r.POST("/api/submit", a.submit)
}

func (a *API) health(c *gin.Context) {
	c.JSON(200, gin.H{"status": "ok"})
}

func (a *API) catalog(c *gin.Context) {
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
	c.JSON(200, public)
}

func (a *API) chapter(c *gin.Context) {
	slug := c.Param("slug")
	ch, ok := a.store.ChapterBySlug(slug)
	if !ok {
		c.JSON(404, gin.H{"error": "章节不存在"})
		return
	}
	if ch.Type == "coding" {
		safe := ch
		for i := range safe.ExerciseList {
			safe.ExerciseList[i].Solution = ""
		}
		c.JSON(200, safe)
		return
	}
	c.JSON(200, ch)
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

func (a *API) run(c *gin.Context) {
	var req runRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "无效请求"})
		return
	}
	if strings.TrimSpace(req.Code) == "" {
		c.JSON(400, gin.H{"error": "代码不能为空"})
		return
	}
	result := runner.RunGo(req.Code, a.timeout)
	c.JSON(200, result)
}

func (a *API) submit(c *gin.Context) {
	var req submitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "无效请求"})
		return
	}
	_, ex, ok := a.store.Exercise(req.ChapterSlug, req.ExerciseID)
	if !ok {
		c.JSON(404, gin.H{"error": "题目不存在"})
		return
	}
	if len(ex.Tests) == 0 {
		c.JSON(200, runner.Validation{Passed: true, Message: "本题为阅读题，已标记完成"})
		return
	}

	for _, tc := range ex.Tests {
		switch tc.Type {
		case "stdout":
			v := runner.ValidateStdout(req.Code, tc.Expected, a.timeout)
			if !v.Passed {
				c.JSON(200, v)
				return
			}
		default:
			c.JSON(400, gin.H{"error": "不支持的测试类型"})
			return
		}
	}

	c.JSON(200, runner.Validation{Passed: true, Message: "通过！做得好 🎉"})
}