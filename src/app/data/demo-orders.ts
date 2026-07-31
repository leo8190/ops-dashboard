import { Order } from '../core/operations.models';

interface DemoOrderSeed {
  readonly id: string;
  readonly externalReference: string;
  readonly customerName: string;
  readonly description: string;
  readonly priority: Order['priority'];
  readonly status: Order['status'];
  readonly createdHoursAgo: number;
  readonly updatedHoursAgo: number;
  readonly cancellationReason?: string;
}

const DEMO_ORDER_SEEDS: readonly DemoOrderSeed[] = [
  {
    id: '6f7ab96b-a810-475b-a5b8-09f2e8850b11',
    externalReference: 'DEMO-1048',
    customerName: 'Northwind Traders',
    description: 'Prepare an expedited warehouse dispatch.',
    priority: 'Critical',
    status: 'Received',
    createdHoursAgo: 2,
    updatedHoursAgo: 2,
  },
  {
    id: '8e64a655-9fe5-43cf-95d0-3c5c4553c8f5',
    externalReference: 'DEMO-1047',
    customerName: 'Atlas Commerce',
    description: 'Reconcile the priority settlement batch before cutoff.',
    priority: 'High',
    status: 'Processing',
    createdHoursAgo: 8,
    updatedHoursAgo: 1,
  },
  {
    id: '290ae06c-7d19-4c49-bcf5-dd3064c51fe3',
    externalReference: 'DEMO-1046',
    customerName: 'Beacon Health',
    description: 'Validate onboarding documents and release provisioning.',
    priority: 'Normal',
    status: 'Completed',
    createdHoursAgo: 29,
    updatedHoursAgo: 21,
  },
  {
    id: '4115736a-0b2d-42f7-818d-535f85ba5a0a',
    externalReference: 'DEMO-1045',
    customerName: 'Fieldhouse Supply',
    description: 'Investigate an inventory synchronization exception.',
    priority: 'High',
    status: 'Cancelled',
    createdHoursAgo: 51,
    updatedHoursAgo: 46,
    cancellationReason: 'Upstream source corrected the event before processing.',
  },
  {
    id: '98999f50-409a-44a0-a2b3-c63c35383d9b',
    externalReference: 'DEMO-1044',
    customerName: 'Loom & Co.',
    description: 'Recover a failed analytics export for the finance team.',
    priority: 'Low',
    status: 'Completed',
    createdHoursAgo: 78,
    updatedHoursAgo: 70,
  },
];

export function createDemoOrders(now = new Date()): readonly Order[] {
  return DEMO_ORDER_SEEDS.map((seed) => {
    const createdAt = hoursBefore(now, seed.createdHoursAgo);
    const updatedAt = hoursBefore(now, seed.updatedHoursAgo);

    return {
      id: seed.id,
      externalReference: seed.externalReference,
      customerName: seed.customerName,
      description: seed.description,
      priority: seed.priority,
      status: seed.status,
      createdAt,
      updatedAt,
      completedAt: seed.status === 'Completed' ? updatedAt : null,
      cancellationReason: seed.cancellationReason ?? null,
      version: seed.status === 'Received' ? 1 : 2,
    };
  });
}

function hoursBefore(now: Date, hours: number): string {
  return new Date(now.getTime() - hours * 60 * 60 * 1_000).toISOString();
}
