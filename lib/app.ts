import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import { sendMessage } from './telegram'

dotenv.config()

const app = express()
const port = process.env.PORT
app.use(bodyParser.json())

app.get('/', async (req, res) => {
    res.send('See https://github.com/felixbade/github-telegram-notifications')
})

app.post('/', async (req, res) => {
    const body = req.body

    console.log(JSON.stringify(body, null, 4))

    if (body.commits !== undefined) {
        const repositoryName = body.repository.name
        const branch = body.ref.replace('refs/heads/', '')

        let numberOfCommits
        if (body.commits.length === 1) {
            numberOfCommits = `1 new commit`
        } else {
            numberOfCommits = `${body.commits.length} new commits`
        }

        const commitsText = body.commits.map((commit) => {
            const commitHash = commit.id.substring(0, 7);
            const message = commit.message
            const author = commit.author.name
            return `<a href="${commit.url}">${commitHash}</a>: ${message} by <b>${author}</b>`
        }).join('\n\n')
        
        const messageToTelegram = `🎾 ${numberOfCommits} to <b>${repositoryName}</b> branch <b>${branch}</b>\n\n${commitsText}`
        await sendMessage(messageToTelegram)
    }

    if (body.pull_request !== undefined) {
        if (body.action === 'opened') {
            const repositoryName = body.repository.name
            const pr = body.pull_request

            const title = `<a href="${pr.url}">${pr.title}</a>`
            const author = pr.user.login

            const oldBranch = pr.head.ref
            const newBranch = pr.base.ref
            const branchText = `${oldBranch} → ${newBranch}`

            const messageToTelegram = `🚚 New pull request ${title} in <b>${repositoryName}</b> by <b>${author}</b>\n${branchText}`
            await sendMessage(messageToTelegram)
        }
    }

    res.send('OK!')
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})