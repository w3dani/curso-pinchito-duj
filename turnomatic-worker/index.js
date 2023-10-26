const Broker = require('rascal').BrokerAsPromised;
const config = require('./config');
const uuid = require('uuid');
const redis = require('redis');

const redisConf = {
    host: process.env.REDIS_HOST,
    port: 6379,
}

// Crea una instancia del cliente Redis
const client = redis.createClient({
    socket: {
        port: redisConf.port,
        host: redisConf.host,
    }
}).on('error', (err) => {
    console.log('error connecting to redis: ' + err.message)
});

const publish_turnomatic_result = async (broker, message) => {
    const publication = await broker.publish('turnomatic-response', message);
    publication.on('error', console.error);
};

const rascal_listening = async () => {
    const broker = await Broker.create(config);
    broker.on('error', console.error);
    console.log(`connecting to redid: ${redisConf.host}:${redisConf.port}`);
    await client.connect()
    const subscription = await broker.subscribe('turnomatic-queue');
    subscription
        .on('message', async (message, content, ackOrNack) => {
            try {
                console.log('worker handling message');
                const {group} = content;
                const newUUID = uuid.v4();
                const counter = client.incr(group, (err, reply) => {
                    if (err) {
                        console.error('Error al guardar en Redis:', err);
                    } else {
                        console.log('Entrada guardada en Redis:', reply);
                        publish_turnomatic_result(broker, {id: newUUID, group, turn: counter});
                    }
                });

                ackOrNack();
            } catch (err) {
                ackOrNack(err, {strategy: 'republish', immediateNack: true});
            }
        })
        .on('error', (err, message, ackOrNack) => {
            ackOrNack(err, {strategy: 'republish', immediateNack: true});
        })
        .on('invalid_content', (err, message, ackOrNack) => {
            ackOrNack(err, {strategy: 'republish', immediateNack: true});
        });
    console.log('broker created!');
};

rascal_listening()
    .then(() => console.log('Rascal listening...'))
    .catch((err) => {
        console.log('Rascal error: ' + err.message);
        process.exit(1)
    });
