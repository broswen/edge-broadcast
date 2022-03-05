export { BroadcastTs } from './broadcast'
// @ts-ignore
import HTML from 'listener.html'

export default {
  fetch: async (request: Request, env: Env) => {
    const url = new URL(request.url)
    console.log(request.method, url.pathname)
    // console.log([...request.headers.values()])

    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(HTML, {headers: {"Content-Type": "text/html;charset=UTF-8"}});
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      return new Response(JSON.stringify({status: 'ok'}))
    }

    if (url.pathname === '/broadcast' && request.method === 'POST') {
      const data = await request.text()
      const broadcast = getBroadcast(env)
      return broadcast.fetch(new Request(request.url, {body: data, method: 'POST'}))
    }

    if (url.pathname === '/listen' && request.method === 'GET') {
      const upgradeHeader = request.headers.get('upgrade')
      console.log('Upgrade header:', upgradeHeader)
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', {status: 426})
      }
      const broadcast = getBroadcast(env)
      return broadcast.fetch(new Request(request.url))
    }

    return new Response('404 not found', {status: 404})
  }

}

function getBroadcast(env: Env): DurableObjectStub {
  const objId = env.BROADCAST.idFromName('A')
  const obj = env.BROADCAST.get(objId)
  return obj
}

interface Env {
  BROADCAST: DurableObjectNamespace
}
