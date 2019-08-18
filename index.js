const subscriptions = require('./lib/subscriptions.js')

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  const repoConfigs = {}
  const repoSubscriptions = {}

  function repoKey (context) {
    const repo = context.repo()
    return repo.owner + '/' + repo.repo
  }

  async function loadConfig (context, force = false) {
    const key = repoKey(context)
    if (!(key in repoConfigs) || force) {
      context.log({ key }, 'loadConfig')
      repoConfigs[key] = await context.config('pytorch-probot.yml')
    }
    return repoConfigs[key]
  }

  async function loadSubscriptions (context, force = false) {
    const key = repoKey(context)
    if (!(key in repoSubscriptions) || force) {
      context.log({ key }, 'loadSubscriptions')
      const config = await loadConfig(context)
      const subsPayload = await context.github.issues.get(context.repo({ number: config.tracking_issue }))
      const subsText = subsPayload.data['body']
      app.log({ subsText })
      repoSubscriptions[key] = subscriptions.parseSubscriptions(subsText)
      app.log({ subscriptions: repoSubscriptions[key] })
    }
    return repoSubscriptions[key]
  }

  app.on('issues.edited', async context => {
    const config = await loadConfig(context)
    const issue = context.issue()
    if (config.tracking_issue === issue.number) {
      await loadSubscriptions(context, /* force */ true)
    }
  })

  app.on('push', async context => {
    if (context.payload.ref === 'refs/heads/master') {
      await loadConfig(context, /* force */ true)
    }
  })

  app.on('issues.labeled', async context => {
    const subscriptions = await loadSubscriptions(context)

    const labels = context.payload['issue']['labels'].map(e => e['name'])
    context.log({ labels })
    const cc = new Set()
    labels.forEach(l => {
      if (l in subscriptions) {
        subscriptions[l].forEach(u => cc.add(u))
      }
    })
    context.log({ cc: Array.from(cc) }, 'from subscriptions')
    if (cc.size) {
      const prevSize = cc.size
      const body = context.payload['issue']['body']
      const reCC = /cc( +@[a-zA-Z0-9-/]+)+/
      const oldCCMatch = body.match(reCC)
      if (oldCCMatch) {
        const oldCCString = oldCCMatch[0]
        context.log({ oldCCString }, 'previous cc string')
        let m
        const reUsername = /@([a-zA-Z0-9-/]+)/g
        while ((m = reUsername.exec(oldCCString)) !== null) {
          cc.add(m[1])
        }
        context.log({ cc: Array.from(cc) }, 'after adding pre-existing ccs')
      }
      if (prevSize !== cc.size || !oldCCMatch) {
        let newCCString = 'cc'
        cc.forEach(u => {
          newCCString += ' @' + u
        })
        const newBody = oldCCMatch ? body.replace(reCC, newCCString) : body + '\n\n' + newCCString
        context.log({ newBody })
        await context.github.issues.update(context.issue({ body: newBody }))
      } else {
        context.log('no action: no change from existing cc list on issue')
      }
    } else {
      context.log('no action: cc list from subscription is empty')
    }
  })
}
