import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ORDERFLOW_API_BASE_URL } from './api-config';
import { CreateOrderRequest, Order, OrderListResponse } from './operations.models';
import { OperationsService } from './operations.service';

const API_BASE_URL = 'https://orderflow.test';

const RECEIVED_ORDER: Order = {
  id: '6f7ab96b-a810-475b-a5b8-09f2e8850b11',
  externalReference: 'OPS-1001',
  customerName: 'Northwind Traders',
  description: 'Prepare an expedited warehouse dispatch.',
  priority: 'Critical',
  status: 'Received',
  createdAt: '2026-07-31T12:00:00.000Z',
  updatedAt: '2026-07-31T12:00:00.000Z',
  completedAt: null,
  cancellationReason: null,
  version: 1,
};

const LIST_RESPONSE: OrderListResponse = {
  items: [RECEIVED_ORDER],
  page: 1,
  pageSize: 100,
  total: 1,
  totalPages: 1,
};

const CREATE_REQUEST: CreateOrderRequest = {
  externalReference: 'OPS-1001',
  customerName: 'Northwind Traders',
  description: 'Prepare an expedited warehouse dispatch.',
  priority: 'Critical',
};

describe('OperationsService', () => {
  let service: OperationsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OperationsService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ORDERFLOW_API_BASE_URL, useValue: API_BASE_URL },
      ],
    });

    service = TestBed.inject(OperationsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the paged OrderFlow queue and enters live mode', async () => {
    const loading = service.loadOrders();
    const request = http.expectOne(
      (candidate) =>
        candidate.url === `${API_BASE_URL}/api/v1/orders/` &&
        candidate.params.get('page') === '1' &&
        candidate.params.get('pageSize') === '100',
    );

    expect(request.request.method).toBe('GET');
    request.flush(LIST_RESPONSE);
    await loading;

    expect(service.connectionMode()).toBe('live');
    expect(service.orders()).toEqual([RECEIVED_ORDER]);
    expect(service.error()).toBeNull();
  });

  it('uses a clearly labelled local demo when the initial API request is offline', async () => {
    const loading = service.loadOrders();
    const request = http.expectOne(`${API_BASE_URL}/api/v1/orders/?page=1&pageSize=100`);
    request.error(new ProgressEvent('network error'));
    await loading;

    expect(service.connectionMode()).toBe('demo');
    expect(service.orders().length).toBeGreaterThan(0);
    expect(service.error()).toContain('unavailable');
  });

  it('creates an order with an idempotency key and reports API replay', async () => {
    const loading = service.loadOrders();
    http.expectOne(`${API_BASE_URL}/api/v1/orders/?page=1&pageSize=100`).flush({
      ...LIST_RESPONSE,
      items: [],
      total: 0,
      totalPages: 0,
    });
    await loading;

    const creating = service.createOrder(CREATE_REQUEST, 'ops-ui-test-1001');
    const request = http.expectOne(`${API_BASE_URL}/api/v1/orders/`);

    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Idempotency-Key')).toBe('ops-ui-test-1001');
    expect(request.request.body).toEqual(CREATE_REQUEST);
    request.flush(RECEIVED_ORDER, { headers: { 'Idempotency-Replayed': 'true' } });
    const created = await creating;

    expect(created).toEqual(RECEIVED_ORDER);
    expect(service.orders()).toEqual([RECEIVED_ORDER]);
    expect(service.notice()).toContain('no duplicate');
  });

  it('calls only valid transition endpoints and updates the loaded order', async () => {
    const loading = service.loadOrders();
    http.expectOne(`${API_BASE_URL}/api/v1/orders/?page=1&pageSize=100`).flush(LIST_RESPONSE);
    await loading;

    const processingOrder: Order = {
      ...RECEIVED_ORDER,
      status: 'Processing',
      updatedAt: '2026-07-31T12:05:00.000Z',
      version: 2,
    };
    const transition = service.transitionOrder(RECEIVED_ORDER.id, 'start');
    const request = http.expectOne(`${API_BASE_URL}/api/v1/orders/${RECEIVED_ORDER.id}/start`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();
    request.flush(processingOrder);
    await transition;

    expect(service.orders()[0]).toEqual(processingOrder);
    expect(service.notice()).toContain('live API');

    const invalid = await service.transitionOrder(RECEIVED_ORDER.id, 'start');
    expect(invalid).toBeNull();
    expect(service.error()).toContain('not valid');
  });

  it('preserves idempotency semantics in demo fallback', async () => {
    const loading = service.loadOrders();
    http
      .expectOne(`${API_BASE_URL}/api/v1/orders/?page=1&pageSize=100`)
      .error(new ProgressEvent('network error'));
    await loading;
    const initialCount = service.orders().length;

    const first = await service.createOrder(CREATE_REQUEST, 'ops-ui-demo-1001');
    const replay = await service.createOrder(CREATE_REQUEST, 'ops-ui-demo-1001');

    expect(first).toEqual(replay);
    expect(service.orders()).toHaveLength(initialCount + 1);
    expect(service.notice()).toContain('no duplicate');
  });
});
