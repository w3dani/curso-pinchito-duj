const Broker = require('rascal').BrokerAsPromised;
const config = require('./config');
const fastify = require('fastify')({
    logger: true
});
const rascal_listening = async () => {
    const broker = await Broker.create(config);
    broker.on('error', (err) => {
        console.error(err)
    });
    const subscription = await broker.subscribe('turnomatic-response');
    subscription
        .on('message', async (message, content, ackOrNack) => {
            try {
                const {body} = message;
                console.log(body)
                ackOrNack();
            } catch (err) {
                ackOrNack(err, {strategy: 'republish', immediateNack: true})
            }
        })
        .on('error', (err, message, ackOrNack) => {
            ackOrNack(err, {strategy: 'republish', immediateNack: true})
        })
        .on('invalid_content', (err, message, ackOrNack) => {
            ackOrNack(err, {strategy: 'republish', immediateNack: true});
        })
    console.log('broker created!')
}

fastify.get('/turn/:group', (request, reply) => {
    const { group } = request.params
    reply.send({ turn: `Your turn is 0 for group ${group}` })
})

// Run the server!
rascal_listening()
    .then(() => {
        console.log('Rascal listening...')
        fastify.listen(3000, '0.0.0.0',  err => {
            if (err) {
                fastify.log.error(err)
                throw err;
            }
        })
    })
    .catch((err) => {
        console.log('Error: ' + err.message)
        process.exit(1)
    });

