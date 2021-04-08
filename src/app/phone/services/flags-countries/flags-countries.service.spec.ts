import { TestBed } from '@angular/core/testing';

import { FlagsCountriesService } from './flags-countries.service';

describe('FlagsCountriesService', () => {
  let service: FlagsCountriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlagsCountriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
