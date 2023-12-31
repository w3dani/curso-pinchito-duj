const Broker = require('rascal').BrokerAsPromised;
const config = require('./config');
const fastify = require('fastify')({
    logger: true
});

let broker;
const promisesMap = {};

const publish_turnomatic_request = async ({ group }) => {
    const publication = await broker.publish('turnomatic-queue', { group });
    publication.on('error', console.error);
};

const rascal_listening = async () => {
    broker = await Broker.create(config);
    broker.on('error', (err) => {
        console.error(err)
    });
    const subscription = await broker.subscribe('turnomatic-response-queue');
    subscription
        .on('message', async (message, content, ackOrNack) => {
            try {
                console.log(content)
                const { id, group, turn } = content;
                const returnFn = promisesMap[group];
                returnFn(turn);
                promisesMap[group] = null;
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
    promisesMap[group] = (turn) => reply.send({turn: `Your turn is 0 for group ${turn}`});
    publish_turnomatic_request({ group })

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

