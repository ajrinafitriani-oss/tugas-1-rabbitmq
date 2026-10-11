const amqp = require('amqplib');

async function startConsumerB() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const mainExchange = 'payments.event';
    const dlxExchange = 'payments.dlx';
    const mainQueue = 'failed_payment_queue';
    const dlqQueue = 'payments_dlq';

    // 1. Buat Exchange & Queue untuk Dead Letter Queue (DLQ)
    await channel.assertExchange(dlxExchange, 'topic', { durable: true });
    await channel.assertQueue(dlqQueue, { durable: true });
    await channel.bindQueue(dlqQueue, dlxExchange, '#');

    // 2. Buat Main Exchange & Queue dengan DLX binding
    await channel.assertExchange(mainExchange, 'topic', { durable: true });
    await channel.assertQueue(mainQueue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': dlxExchange,
        'x-dead-letter-routing-key': 'payment.failed.dlx'
      }
    });
    await channel.bindQueue(mainQueue, mainExchange, 'payment.failed');

    console.log(' [*] Consumer B (Failed Worker) siap menerima pesan...');

    channel.consume(mainQueue, (msg) => {
      if (msg !== null) {
        const headers = msg.properties.headers || {};
        const deathHeader = headers['x-death'];
        const retryCount = deathHeader ? deathHeader[0].count : 0;

        console.log(` [Consumer B] Pesan Gagal Diterima (Percobaan ke-${retryCount + 1}):`, msg.content.toString());

        if (retryCount < 2) {
          console.log(` [Consumer B] Menunggu 5 detik (TTL), lalu kirim ulang/retry...`);
          setTimeout(() => {
            // Reject/NACK tanpa requeue untuk mendorong ke retry/DLX
            channel.nack(msg, false, false);
          }, 5000);
        } else {
          console.log(` [Consumer B] Sudah retry 2x, memasukkan pesan ke Dead Letter Queue (payments.dlx)...`);
          channel.nack(msg, false, false);
        }
      }
    }, { noAck: false });
  } catch (error) {
    console.error('Error Consumer B:', error);
  }
}

startConsumerB();