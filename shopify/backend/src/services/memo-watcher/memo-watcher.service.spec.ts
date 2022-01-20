import { Test, TestingModule } from '@nestjs/testing';
import { MemoWatcherService } from './memo-watcher.service';

describe('MemoWatcherService', () => {
  let service: MemoWatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoWatcherService],
    }).compile();

    service = module.get<MemoWatcherService>(MemoWatcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
