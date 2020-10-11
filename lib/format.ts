import { htmlEscape } from './telegram'

export const formatCommits = (body: any) => {
    const repositoryName = body.repository.name
    const branch = body.ref.replace('refs/heads/', '')

    // if body.deleted -> Deleted branch, commits = []
    // 🧹 Deleted branch feature-1 from repo

    let numberOfCommits
    if (body.commits.length === 1) {
        numberOfCommits = `1 new commit`
    } else {
        numberOfCommits = `${body.commits.length} new commits`
    }

    const commitsText = body.commits.map((commit) => {
        const commitHash = commit.id.substring(0, 7);
        const message = htmlEscape(commit.message)
        const author = commit.author.name
        return `<a href="${commit.url}">${commitHash}</a>: ${message} by <b>${author}</b>`
    }).join('\n\n')
    
    let formattedMessage = `🎾 ${numberOfCommits} to <b>${repositoryName}</b> branch <b>${branch}</b>\n\n${commitsText}`

    if (body.forced) {
        formattedMessage = '🤜 Force push\n' + formattedMessage
    }

    return formattedMessage
}

export const formatPullRequest = (body: any) => {
    const repositoryName = body.repository.name
    const pr = body.pull_request
    const title = `<a href="${pr.html_url}">${htmlEscape(pr.title)}</a>`

    const oldBranch = pr.head.ref
    const newBranch = pr.base.ref
    const branchText = `${oldBranch} → ${newBranch}`

    if (body.action === 'opened') {
        const author = pr.user.login
        return `🚚 New pull request ${title} in <b>${repositoryName}</b> by <b>${author}</b>\n${branchText}`
    }

    if (body.action === 'closed') {
        const user = body.sender.login
        let formattedMessage = `${title} in <b>${repositoryName}</b> by <b>${user}</b>\n${branchText}`
        if (pr.merged) {
            return '✅ Merged pull request ' + formattedMessage
        } else {
            return '🚫 Rejected pull request ' + formattedMessage
        }
    }

    //body.comment.body -> selitys
    return undefined
}