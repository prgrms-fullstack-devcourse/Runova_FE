export type ImageProcessResult = {
  success: boolean;
  imageURL?: string;
  error?: string;
  captureSuccess?: boolean;
  uploadSuccess?: boolean;
  captureError?: string;
  uploadError?: string;
};
