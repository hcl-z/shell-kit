import { Octokit } from 'octokit'

const octokit = new Octokit({ auth: `personal-access-token123` })

// Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user

function validateRepoAuth(name: string) {

}

export async function getRepo({ owner, repo }: {
  owner: string
  repo: string
}) {
  await octokit.request('GET /repos/{owner}/{repo}', {
    owner,
    repo,
  })
}

export async function deleteRepo({ owner, repo }: {
  owner: string
  repo: string
}) {
  await octokit.request('DELETE /repos/{owner}/{repo}', {
    owner,
    repo,
  })
}

export async function createRepo({ repo, description, isPrivate = true }: {
  owner: string
  repo: string
  description?: string
  isPrivate?: boolean
}) {
  await octokit.request('POST /user/repos', {
    name: repo,
    description,
    private: isPrivate,
  })
}

export async function changeRepoPrivacy({ owner, repo, visibility }: {
  owner: string
  repo: string
  visibility: 'public' | 'private'
}) {
  await octokit.request('PATCH /repos/{owner}/{repo}', {
    owner,
    repo,
    private: visibility === 'private',
  })
}
