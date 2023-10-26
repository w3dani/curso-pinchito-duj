const Broker = require('rascal').BrokerAsPromised;
const config = require('./config');
const uuid = require('uuid');

const publish_turnomatic_result = async (broker, message) => {
  const publication = await broker.publish('turnomatic-response', message);
  publication.on('error', console.error);
};

const rascal_listening = async () => {
  const broker = await Broker.create(config);
  broker.on('error', console.error);
  const subscription = await broker.subscribe('turnomatic-queue');
  subscription
    .on('message', async (message, content, ackOrNack) => {
      try {
        const { group } = message;
        const newUUID = uuid.v4();
        const counter = client.incr(group, (err, reply) => {
          if (err) {
            console.error('Error al guardar en Redis:', err);
          } else {
            console.log('Entrada guardada en Redis:', reply);
          }
        });
        await publish_turnomatic_result(broker, { id: newUUID, turn: counter });
        ackOrNack();
        client.quit();
      } catch (err) {
        ackOrNack(err, { strategy: 'republish', immediateNack: true });
      }
    })
    .on('error', (err, message, ackOrNack) => {
      ackOrNack(err, { strategy: 'republish', immediateNack: true });
    })
    .on('invalid_content', (err, message, ackOrNack) => {
      ackOrNack(err, { strategy: 'republish', immediateNack: true });
    });
  console.log('broker created!');
};

rascal_listening()
  .then(() => console.log('Rascal listening...'))
  .catch((err) => console.log('Rascal error: ' + err.message));
