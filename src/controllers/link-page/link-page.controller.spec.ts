import { Test, TestingModule } from '@nestjs/testing';
import { LinkPageController } from './link-page.controller';

describe('LinkPageController', () => {
	let controller: LinkPageController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
		controllers: [LinkPageController],
		}).compile();

		controller = module.get<LinkPageController>(LinkPageController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
