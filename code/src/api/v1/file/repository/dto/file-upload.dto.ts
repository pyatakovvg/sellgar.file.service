export interface FileUploadDto {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  width: number;
  height: number;
  buffer: string;
}
