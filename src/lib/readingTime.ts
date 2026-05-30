import fs from 'fs';
import path from 'path';

// Irregular slug → component folder mappings (where PascalCase rule doesn't apply)
const SLUG_OVERRIDES: Record<string, string> = {
  'event-loop':            'EventLoopArticle',
  'critical-rendering-path': 'CriticalRenderingPathArticle',
  'http-request':          'HttpRequestArticle',
  'how-browser-works':     'HowBrowserWorksArticle',
  'progressive-ssr':       'ProgressiveSsrArticle',
  'csr-vs-ssr':            'CsrVsSsrArticle',
  'backend-roadmap':       'BackendArticle',
  'rest-api-design':       'RestApiArticle',
  'auth-jwt':              'AuthJwtArticle',
  'oauth-openid':          'OAuthArticle',
  'owasp-top10':           'OwaspArticle',
  'redis-basics':          'RedisArticle',
  'databases-intro':       'DatabasesIntroArticle',
  'db-keys':               'DbKeysArticle',
  'sql-queries':           'SqlQueriesArticle',
  'sql-joins':             'SqlJoinsArticle',
  'sql-dml':               'SqlDmlArticle',
  'postgresql-indexes':    'PostgresIndexesArticle',
  'what-devops-knows':     'DevOpsArticle',
  'linux-basics':          'LinuxArticle',
  'ml-how-it-works':       'MlHowItWorksArticle',
  'llm-architecture':      'LlmArchitectureArticle',
  'ai-api-integration':    'AiApiArticle',
  'prompt-engineering':    'PromptEngineeringArticle',
  'rag-architecture':      'RagArchitectureArticle',
  'vector-databases':      'VectorDatabasesArticle',
  'ai-agents':             'AiAgentsArticle',
  'ai-frameworks':         'AiFrameworksArticle',
  'fine-tuning':           'FineTuningArticle',
  'ml-training-loop':      'MlTrainingLoopArticle',
  'ai-in-production':      'AiInProductionArticle',
  'ai-safety':             'AiSafetyArticle',
  'big-o':                 'BigOArticle',
  'binary-search':         'BinarySearchArticle',
  'two-pointers':          'TwoPointersArticle',
  'sliding-window':        'SlidingWindowArticle',
  'sorting-algorithms':    'SortingArticle',
};

function slugToDirName(slug: string): string {
  if (SLUG_OVERRIDES[slug]) return SLUG_OVERRIDES[slug];
  // Fallback: PascalCase + Article
  const pascal = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return `${pascal}Article`;
}

const ARTICLES_DIR = path.join(process.cwd(), 'src', 'components', 'articles');

/** Returns the TSX file path for an article, or null if none found */
export function getArticleFilePath(articleSlug: string): string | null {
  const dirName = slugToDirName(articleSlug);
  const filePath = path.join(ARTICLES_DIR, dirName, `${dirName}.tsx`);
  if (fs.existsSync(filePath)) return filePath;
  return null;
}

function countWords(raw: string): number {
  // Strip code blocks (code={`...`}) — code reading accounted for separately
  let text = raw.replace(/code=\{`[\s\S]*?`\}/g, '');
  // Strip import lines
  text = text.replace(/^import .+;\n/gm, '');
  // Strip JSX tags
  text = text.replace(/<[^>]*>/g, ' ');
  // Strip short {expressions} — keep long ones (might contain inline text)
  text = text.replace(/\{[^}]{0,120}\}/g, ' ');
  // Strip string literals used as props
  text = text.replace(/"[^"]{0,80}"/g, ' ');
  // Count Cyrillic + Latin words (>2 chars to skip JSX noise)
  return (text.match(/[а-яёА-ЯЁa-zA-Z]{3,}/g) || []).length;
}

function countCodeLines(raw: string): number {
  // Each code block line ≈ 0.5 sec to read → factor code into estimate
  const blocks = raw.match(/code=\{`[\s\S]*?`\}/g) || [];
  return blocks.reduce((sum, b) => sum + (b.match(/\n/g) || []).length, 0);
}

/**
 * Calculates reading time (minutes) by counting prose words in the article TSX
 * + quiz questions in quizData.ts (if present).
 * Returns null if no article file found (placeholder).
 */
export function calcReadingTime(articleSlug: string): number | null {
  const filePath = getArticleFilePath(articleSlug);
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  let words = countWords(raw);
  const codeLines = countCodeLines(raw);

  // Also count quiz questions text from quizData.ts
  const quizPath = path.join(path.dirname(filePath), 'quizData.ts');
  if (fs.existsSync(quizPath)) {
    words += countWords(fs.readFileSync(quizPath, 'utf-8'));
  }

  // Russian technical prose: ~200 wpm
  // Code blocks: ~30 lines/min (developer skims structure)
  const proseMins = words / 200;
  const codeMins  = codeLines / 30;

  return Math.max(3, Math.round(proseMins + codeMins));
}
