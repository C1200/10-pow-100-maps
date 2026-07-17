export interface Marker {
  id: string;
  load(): Promise<string>;
}
