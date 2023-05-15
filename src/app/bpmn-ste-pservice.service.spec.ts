import { TestBed } from '@angular/core/testing';

import { BpmnStePServiceService } from './bpmn-ste-pservice.service';

describe('BpmnStePServiceService', () => {
  let service: BpmnStePServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BpmnStePServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
