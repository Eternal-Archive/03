import { Body, Controller, Post } from '@nestjs/common';
import { Client as QStashClient } from '@upstash/qstash';

const qstash = new QStashClient({
  token: process.env.QSTASH_TOKEN!,
});

@Controller('qstash')
export class QstashController {
  @Post('test-publish')
  async publish(@Body() body: any) {
    const url = process.env.QSTASH_CALLBACK_URL!;
    const res = await qstash.publishJSON({
      url,
      body: { hello: 'world', echo: body ?? null }
    });
    return { messageId: res.messageId };
  }
}
