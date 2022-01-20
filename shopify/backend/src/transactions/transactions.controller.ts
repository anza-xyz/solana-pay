import { Controller, Get, Post, Query } from '@nestjs/common';
import { TransactionDto } from 'src/transactions/dto/transaction.dto';
import { MemoWatcherService } from 'src/services/memo-watcher/memo-watcher.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionWatcherService: MemoWatcherService) {}

  @Post('watch')
  async watchTransaction(
    @Query() { transactionId }: TransactionDto,
  ): Promise<void> {
    await this.transactionWatcherService.watchTransactionId(transactionId);
  }

  @Get('check')
  checkTransaction(@Query() { transactionId }: TransactionDto): any {
    return transactionId;
  }
}
