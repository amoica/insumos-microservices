// create-revision.dto.ts
export class CreateRevisionDto {
    ordenFabricacionId: number;
    snapshot: any;
    version: number;
    revisionObservacion?: string;
  }