import { TestBed } from '@angular/core/testing';

import { RetroboardService } from './retroboard.service';

describe('RetroboardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RetroboardService = TestBed.get(RetroboardService);
    expect(service).toBeTruthy();
  });
});
