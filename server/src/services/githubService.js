import axios from 'axios'

const API_HEADERS = process.env.GITHUB_TOKEN 
  ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
  : {}

const VALID_EXTENSIONS = new Set([
  'js', 'jsx', 'mjs', 'cjs', 'ts', 'tsx', 'py', 'java', 'go', 'rs', 'cpp', 'cc', 'cxx', 'c', 'cs', 'php', 'rb', 'swift', 'kt', 'sql', 'html', 'css', 'scss', 'sh', 'bash', 'json', 'yml', 'yaml', 'md'
])

const IGNORED_PATHS = [
  'node_modules/', 'dist/', 'build/', '.git/', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'coverage/', '.next/', 'out/', 'public/'
]

function detectLanguage(filename) {
  const ext = filename.split('.').pop()?.toLowerCase()
  const MAP = {
    js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'typescript',
    py: 'python', java: 'java', go: 'go', rs: 'rust',
    cpp: 'cpp', cc: 'cpp', cxx: 'cpp', c: 'c', cs: 'csharp',
    php: 'php', rb: 'ruby', swift: 'swift', kt: 'kotlin',
    sql: 'sql', html: 'html', css: 'css', sh: 'bash', bash: 'bash',
  }
  return MAP[ext] || 'plaintext'
}

export function parseGithubUrl(url) {
  try {
    const u = new URL(url.trim());
    if (u.hostname === 'raw.githubusercontent.com') {
      return { type: 'raw', rawUrl: url.trim() };
    }
    
    if (u.hostname !== 'github.com') {
      throw new Error('Not a GitHub URL');
    }

    // Path format: /owner/repo/blob/branch/path... OR /owner/repo
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) {
      throw new Error('Invalid GitHub URL');
    }

    const [owner, repo, type, branch, ...pathParts] = parts;
    const path = pathParts.join('/');

    if (type === 'blob' || type === 'tree') {
      if (!branch || !path) {
        // Just the repo
        return { type: 'repo', owner, repo };
      }
      return {
        type: 'file',
        owner, repo, branch, path,
        rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
      };
    }

    return { type: 'repo', owner, repo };
  } catch (err) {
    throw new Error('Invalid GitHub URL. Please provide a valid repository or file URL.');
  }
}

export async function fetchGithubTree(githubUrl) {
  const parsed = parseGithubUrl(githubUrl)
  
  if (parsed.type !== 'repo') {
    throw new Error('Please provide a base repository URL to fetch the file tree.')
  }

  const { owner, repo } = parsed
  let defaultBranch = 'main'
  try {
    const { data: repoInfo } = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { 
      timeout: 10000,
      headers: API_HEADERS
    })
    defaultBranch = repoInfo.default_branch || 'main'
  } catch (e) {
    if (e.response?.status === 404) throw new Error('Repository not found or is private.')
    if (e.response?.status === 403) throw new Error('GitHub API rate limit exceeded. Please wait or add a GITHUB_TOKEN.')
    console.warn('Could not fetch repo info, defaulting to main branch.')
  }

  let tree = []
  try {
    const { data: treeInfo } = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`, { 
      timeout: 15000,
      headers: API_HEADERS
    })
    tree = treeInfo.tree
  } catch (e) {
    if (e.response?.status === 403) throw new Error('GitHub API rate limit exceeded. Please wait or add a GITHUB_TOKEN.')
    throw new Error(`Could not fetch files for branch ${defaultBranch}. Is the repository private?`)
  }

  const sourceFiles = tree.filter(item => {
    if (item.type !== 'blob') return false
    if (IGNORED_PATHS.some(ip => item.path.includes(ip))) return false
    const ext = item.path.split('.').pop()?.toLowerCase()
    return VALID_EXTENSIONS.has(ext)
  }).map(item => ({
    path: item.path,
    url: `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${item.path}`
  }))

  return sourceFiles
}

export async function fetchGithubFile(githubUrl) {
  const parsed = parseGithubUrl(githubUrl)

  if (parsed.type === 'repo') {
    throw new Error('A full repository URL was provided. Please select a specific file to review.')
  }

  const { data: code } = await axios.get(parsed.rawUrl, {
    timeout: 15000,
    responseType: 'text',
    headers: { 
      ...API_HEADERS,
      Accept: 'text/plain' 
    },
  })

  if (!code || typeof code !== 'string' || code.trim().length === 0) throw new Error('File is empty')
  if (code.length > 100000) throw new Error('File size exceeds the 100KB limit for reviews.')

  const language = detectLanguage(parsed.rawUrl)
  return { code, language }
}
