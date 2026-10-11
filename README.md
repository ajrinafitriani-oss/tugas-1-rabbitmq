# Tugas 1 RabbitMQ - Topic Exchange & DLX

Repositori ini berisi implementasi Tugas 1 RabbitMQ dengan arsitektur 1 Producer dan 2 Consumer yang memanfaatkan Topic Exchange (`payments.event`) dan Dead Letter Exchange (`payments.dlx`).

## Persyaratan Sistem
- Docker Desktop (untuk menjalankan server RabbitMQ)
- Node.js (untuk menjalankan source code program)

## 1. Cara Menjalankan Server RabbitMQ (Docker)

Sesuai ketentuan, jalankan perintah Docker berikut di terminal untuk mengaktifkan RabbitMQ beserta plugin Management UI:

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

## 2. Cara Menjalankan Program (Source Code)
Buka terminal di dalam folder proyek ini, lalu install dependensi amqplib dengan perintah:

Bash
npm install
Buka 3 tab atau jendela terminal yang berbeda untuk menjalankan masing-masing komponen secara bersamaan:

Terminal 1: Menjalankan Consumer A (Success Worker)
Mendengarkan antrean success_payment_queue dan memproses pesan dengan manual ACK.

Bash
node consumer_a.js
Terminal 2: Menjalankan Consumer B (Failed & DLX Worker)
Mendengarkan antrean failed_payment_queue, melakukan percobaan ulang (retry) maksimal 2 kali dengan jeda 5 detik, lalu melempar pesan gagal ke Dead Letter Queue (payments_dlq).

Bash
node consumer_b.js
Terminal 3: Menjalankan Producer
Bertugas mempublikasikan pesan payment.success dan payment.failed ke exchange payments.event.

Bash
node producer.js