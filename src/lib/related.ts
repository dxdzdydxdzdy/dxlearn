import { courses, type Article, type Course } from '@/content/courses';

export interface RelatedItem {
  course: Course;
  article: Article;
}

/**
 * Returns up to 3 related articles based on tag overlap and course proximity.
 * Excludes the current article.
 */
export function getRelatedArticles(
  currentCourseSlug: string,
  currentArticleSlug: string,
): RelatedItem[] {
  const currentCourse = courses.find(c => c.slug === currentCourseSlug);
  const currentArticle = currentCourse?.articles.find(a => a.slug === currentArticleSlug);
  if (!currentCourse || !currentArticle) return [];

  const currentTags = new Set(currentArticle.tags ?? []);
  const currentSection = currentArticle.section ?? null;

  const candidates: { item: RelatedItem; score: number }[] = [];

  for (const course of courses) {
    for (const article of course.articles) {
      // Skip self
      if (course.slug === currentCourseSlug && article.slug === currentArticleSlug) continue;

      let score = 0;

      // Tag overlap — primary signal
      const sharedTags = (article.tags ?? []).filter(t => currentTags.has(t)).length;
      score += sharedTags * 3;

      // Same course, same section
      if (course.slug === currentCourseSlug && article.section === currentSection) {
        score += 2;
      }
      // Same course, different section
      else if (course.slug === currentCourseSlug) {
        score += 1;
      }

      // Only include if there's some relevance
      if (score > 0) {
        candidates.push({ item: { course, article }, score });
      }
    }
  }

  // Sort by score desc, shuffle ties for variety
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Deterministic tie-break: alphabetical by slug
    return a.item.article.slug.localeCompare(b.item.article.slug);
  });

  return candidates.slice(0, 3).map(c => c.item);
}
