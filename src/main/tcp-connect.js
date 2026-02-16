// TCP proxy helper - spawned as a child process to bypass macOS blocking
// Electron from local network access. Listens on localhost and proxies
// traffic to the target host.
const net = require('net')

const { host, port } = JSON.parse(process.argv[2])

const server = net.createServer((local) => {
  const remote = net.createConnection({ host, port }, () => {
    local.pipe(remote)
    remote.pipe(local)
  })

  remote.on('error', (err) => {
    local.destroy(err)
  })

  local.on('error', () => {
    remote.destroy()
  })

  local.on('close', () => remote.destroy())
  remote.on('close', () => local.destroy())
})

// Listen on a random port on localhost
server.listen(0, '127.0.0.1', () => {
  const localPort = server.address().port
  process.send({ type: 'listening', port: localPort })

  // Accept only one connection then stop listening
  server.once('connection', () => {
    server.close()
  })
})

server.on('error', (err) => {
  process.send({ type: 'error', message: err.message })
  process.exit(1)
})

// Keep alive until parent disconnects IPC
process.on('disconnect', () => {
  server.close()
  process.exit(0)
})
