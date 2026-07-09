package content

import (
	"encoding/json"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
)

type Section struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Range       string `json:"range"`
	Description string `json:"description"`
}

type TestCase struct {
	Type     string `json:"type"`
	Expected string `json:"expected"`
}

type Exercise struct {
	ID           string     `json:"id"`
	Title        string     `json:"title"`
	Description  string     `json:"description"`
	Hint         string     `json:"hint,omitempty"`
	Explanation  string     `json:"explanation,omitempty"`
	StarterCode  string     `json:"starterCode"`
	Solution     string     `json:"solution,omitempty"`
	Tests        []TestCase `json:"tests"`
}

type ChapterSection struct {
	ID           string     `json:"id"`
	Title        string     `json:"title"`
	Content      string     `json:"content,omitempty"`
	ExerciseList []Exercise `json:"exerciseList,omitempty"`
	Subheadings  []string   `json:"subheadings,omitempty"`
}

type Chapter struct {
	ID           string            `json:"id"`
	Slug         string            `json:"slug"`
	Title        string            `json:"title"`
	Summary      string            `json:"summary"`
	Type         string            `json:"type"`
	Minutes      int               `json:"minutes"`
	Exercises    int               `json:"exercises"`
	Section      string            `json:"section"`
	Content      string            `json:"content,omitempty"`
	ExerciseList []Exercise        `json:"exerciseList,omitempty"`
	Sections     []ChapterSection  `json:"sections,omitempty"`
}

type Catalog struct {
	Sections []Section `json:"sections"`
	Chapters []Chapter `json:"chapters"`
}

type Store struct {
	mu      sync.RWMutex
	catalog Catalog
	path    string
}

func NewStore(contentPath string) (*Store, error) {
	s := &Store{path: contentPath}
	if err := s.reload(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *Store) reload() error {
	data, err := os.ReadFile(s.path)
	if err != nil {
		return err
	}
	var catalog Catalog
	if err := json.Unmarshal(data, &catalog); err != nil {
		return err
	}
	s.mu.Lock()
	s.catalog = catalog
	s.mu.Unlock()
	return nil
}

func (s *Store) Catalog() Catalog {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.catalog
}

func (s *Store) ChapterBySlug(slug string) (Chapter, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, ch := range s.catalog.Chapters {
		if ch.Slug == slug {
			content := s.lessonContent(slug, ch.Content)
			ch.Content = content
			if len(ch.Sections) > 0 {
				ch.Sections = s.splitContentIntoSections(content, ch.Sections)
			} else {
				ch.Sections = []ChapterSection{
					{
						ID:    ch.ID + "-01",
						Title: "本章内容",
						Content: content,
					},
				}
				for i := range ch.Sections {
					var subheadings []string
					lines := strings.Split(ch.Sections[i].Content, "\n")
					for _, line := range lines {
						if matches := headingRegex.FindStringSubmatch(line); matches != nil {
							heading := strings.TrimSpace(matches[1])
							if heading != "" {
								subheadings = append(subheadings, heading)
							}
						}
					}
					ch.Sections[i].Subheadings = subheadings
				}
			}
			return ch, true
		}
	}
	return Chapter{}, false
}

var sectionStartRegex = regexp.MustCompile(`<!--\s*section:start:([^\s]+)\s*-->`)
	var sectionEndRegex = regexp.MustCompile(`<!--\s*section:end:([^\s]+)\s*-->`)
	var headingRegex = regexp.MustCompile(`^##\s+(.+)`)

	func (s *Store) splitContentIntoSections(content string, sections []ChapterSection) []ChapterSection {
	lines := strings.Split(content, "\n")
	result := make([]ChapterSection, len(sections))
	copy(result, sections)

	sectionMap := make(map[string]struct{ start, end int })
	for i, line := range lines {
		if matches := sectionStartRegex.FindStringSubmatch(line); matches != nil {
			id := matches[1]
			info := sectionMap[id]
			info.start = i + 1
			sectionMap[id] = info
		}
		if matches := sectionEndRegex.FindStringSubmatch(line); matches != nil {
			id := matches[1]
			info := sectionMap[id]
			info.end = i
			sectionMap[id] = info
		}
	}

	for i := range result {
		id := result[i].ID
		info, ok := sectionMap[id]
		if !ok || info.start >= info.end {
			continue
		}
		sectionLines := lines[info.start:info.end]
		result[i].Content = strings.Join(sectionLines, "\n")
		
		var subheadings []string
		for _, line := range sectionLines {
			if matches := headingRegex.FindStringSubmatch(line); matches != nil {
				heading := strings.TrimSpace(matches[1])
				if heading != "" {
					subheadings = append(subheadings, heading)
				}
			}
		}
		result[i].Subheadings = subheadings
	}

	return result
}

func (s *Store) lessonContent(slug, fallback string) string {
	lessonDir := filepath.Join(filepath.Dir(s.path), "lessons")
	lessonPath := filepath.Join(lessonDir, slug+".md")
	data, err := os.ReadFile(lessonPath)
	if err != nil {
		return fallback
	}
	return string(data)
}

func (s *Store) Exercise(chapterSlug, exerciseID string) (Chapter, Exercise, bool) {
	ch, ok := s.ChapterBySlug(chapterSlug)
	if !ok {
		return Chapter{}, Exercise{}, false
	}
	for _, ex := range ch.ExerciseList {
		if ex.ID == exerciseID {
			return ch, ex, true
		}
	}
	for _, section := range ch.Sections {
		for _, ex := range section.ExerciseList {
			if ex.ID == exerciseID {
				return ch, ex, true
			}
		}
	}
	return Chapter{}, Exercise{}, false
}

func ResolveContentPath() string {
	candidates := []string{
		"content/chapters.json",
		"../content/chapters.json",
		filepath.Join("..", "..", "content", "chapters.json"),
	}
	for _, p := range candidates {
		if _, err := os.Stat(p); err == nil {
			abs, _ := filepath.Abs(p)
			return abs
		}
	}
	return "content/chapters.json"
}
