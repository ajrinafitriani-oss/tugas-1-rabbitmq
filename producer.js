const amqp = require('amqplib');

async function sendPayments() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchangeName = 'payments.event';

    // Buat Topic Exchange
    await channel.assertExchange(exchangeName, 'topic', { durable: true });

    // 1. Kirim pesan Sukses (routing key: payment.success)
    const successMsg = JSON.stringify({ orderId: 'ORD-101', amount: 150000, status: 'SUCCESS' });
    channel.publish(exchangeName, 'payment.success', Buffer.from(successMsg));
    console.log(' [Producer] Kirim Pesan Sukses:', successMsg);

    // 2. Kirim pesan Gagal (routing key: payment.failed)
    const failedMsg = JSON.stringify({ orderId: 'ORD-102', amount: 200000, status: 'FAILED' });
    channel.publish(exchangeName, 'payment.failed', Buffer.from(failedMsg));
    console.log(' [Producer] Kirim Pesan Gagal:', failedMsg);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error('Error Producer:', error);
  }
}

sendPayments();