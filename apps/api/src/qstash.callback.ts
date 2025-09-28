import { Controller, Post, Req, Res } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { Receiver } from '@upstash/qstash';
import { prisma } from './integrations';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

@Controller('qstash')
export class QstashCallbackController {
  @Post('callback')
  async handle(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const signature = (req.headers['upstash-signature'] ?? '') as string;
    const rawBody = (req as any).rawBody as string;

    try {
      await receiver.verify({ signature, body: rawBody });

      await prisma.webhookLog.create({
        data: { source: 'qstash', payload: (req as any).body }
      });

      return res.code(200).send({ status: '回调 OK' });
    } catch (e: any) {
      return res.code(400).send({ error: 'invalid signature' });
    }
  }
}
