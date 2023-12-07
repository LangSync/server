export interface BaseAdapterInterface {
  adapterFileExtension: string;
  parseStringToObject(filePath: string): any;
  stringifyObjectToString(object: any): string;
}
