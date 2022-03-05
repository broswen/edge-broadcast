export class BroadcastTs {
  state: DurableObjectState
  sessions: WebSocket[]
  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.sessions = [];
  }

  // Handle HTTP requests from clients.
  async fetch(request: Request) {
    // Apply requested action.
    if (request.method === 'POST') {
      //  sending broadcast message
      const message = await request.text();
      this.broadcast(message)
      return new Response(JSON.stringify({status: 'received'}))
    }
    //  connecting websocket
    const webSocketPair = new WebSocketPair()
    const [client, server] = Object.values(webSocketPair)
    server.accept()
    this.sessions.push(server)
    server.addEventListener('message', async (message) => {
      try {
        console.log(JSON.parse(String(message.data)))
      } catch {
        console.log(String(message.data))
      }
    })

    return new Response(null, {status: 101, webSocket: client})
    // await this.state.storage?.put("value", value);
  }

  broadcast(message: string) {
    console.log('broadcasting:', message)
    this.sessions = this.sessions.filter(session => {
      try {
        session.send(JSON.stringify({message, timestamp: Date.now()}))
      } catch (err) {
        console.log(err)
        return false
      }
      return true
    })
  }
}

interface Env {}
