import { Test, TestingModule } from '@nestjs/testing';
import { JwksController } from './jwks.controller';

describe('JwksController', () => {
  let controller: JwksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JwksController],
    }).compile();

    controller = module.get<JwksController>(JwksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
