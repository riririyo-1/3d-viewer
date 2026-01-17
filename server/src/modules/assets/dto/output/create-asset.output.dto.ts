export class CreateAssetOutputDto {
  id: string;
  name: string;
  type: string;
  size: number;
  storagePath: string;
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
