import { OperationsService } from './operations.service';

describe('OperationsService', () => {
  it('updates a workflow without mutating unrelated items', () => {
    const service = new OperationsService();
    const target = service.workItems()[0];
    const untouched = service.workItems()[1];

    service.updateStatus(target.id, 'blocked');

    expect(service.workItems().find((item) => item.id === target.id)?.status).toBe('blocked');
    expect(service.workItems().find((item) => item.id === untouched.id)).toEqual(untouched);
  });

  it('acknowledges a matching incident', () => {
    const service = new OperationsService();
    const target = service.incidents().find((incident) => !incident.acknowledged);

    expect(target).toBeDefined();
    service.acknowledgeIncident(target!.id);

    expect(service.incidents().find((incident) => incident.id === target!.id)?.acknowledged).toBe(
      true,
    );
  });

  it('keeps unknown identifiers as safe no-ops', () => {
    const service = new OperationsService();
    const itemsBefore = service.workItems();
    const incidentsBefore = service.incidents();

    service.updateStatus('OPS-UNKNOWN', 'at-risk');
    service.acknowledgeIncident('INC-UNKNOWN');

    expect(service.workItems()).toEqual(itemsBefore);
    expect(service.incidents()).toEqual(incidentsBefore);
  });
});
