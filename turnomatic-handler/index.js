const fastify = require('fastify')({
    logger: true
})
  
fastify.get('/turn/:group', (request, reply) => {
    const { group } = request.params
    reply.send({ turn: `Your turn is 0 for group ${group}` })
})

// Run the server!
fastify.listen(3000, '0.0.0.0',  err => {
    if (err) {
      fastify.log.error(err)
      process.exit(1)
    }
})