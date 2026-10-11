const amqp = require('amqplib');

async function startConsumerA() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchangeName = 'payments.event';
    const queueName = 'success_payment_queue';

    await channel.assertExchange(exchangeName, 'topic', { durable: true });
    await channel.assertQueue(queueName, { durable: true });
    await channel.bindQueue(queueName, exchangeName, 'payment.success');

    console.log(' [*] Consumer A (Success Worker) siap menerima pesan...');

    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        const data = msg.content.toString();
        console.log(' [Consumer A] Berhasil memproses payment.success & Update DB:', data);
        
        // Manual ACK
        channel.ack(msg);
      }
    }, { noAck: false });
  } catch (error) {
    console.error('Error Consumer A:', error);
  }
}

startConsumerA();