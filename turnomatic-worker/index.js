const Broker = require('rascal').BrokerAsPromised;
const config = require('./config');

const rascal_listening = async () => {
    const broker = await Broker.create(config);
    broker.on('error', console.error);
    const subscription = await broker.subscribe('turnomatic-queue');
    subscription
        .on('message', async (message, content, ackOrNack) => {
            try {
                const {body} = message;
                console.log(body);
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

rascal_listening()
    .then(() => console.log('Rascal listening...'))
    .catch((err) => console.log('Rascal error: ' + err.message));
