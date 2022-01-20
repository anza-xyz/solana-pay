import { Test, TestingModule } from '@nestjs/testing';
import { KeystoreService } from './keystore.service';

describe('KeystoreService', () => {
  let service: KeystoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeystoreService],
    }).compile();

    service = module.get<KeystoreService>(KeystoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
