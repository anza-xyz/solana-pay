import { Controller, Get, Post, Query } from '@nestjs/common';
import { TransactionDto } from 'src/payments/dto/transaction.dto';
import { MemoWatcherService } from 'src/services/memo-watcher/memo-watcher.service';

@Controller('payments')
export class PaymentsController {
  constructor(private transactionWatcherService: MemoWatcherService) {}

  @Post('observe')
  async observeTransaction(
    @Query() { transactionId }: TransactionDto,
  ): Promise<void> {
    await this.transactionWatcherService.watchTransactionId(transactionId);
  }

  @Get('check')
  checkTransaction(@Query() { transactionId }: TransactionDto): any {
    return transactionId;
  }
}
