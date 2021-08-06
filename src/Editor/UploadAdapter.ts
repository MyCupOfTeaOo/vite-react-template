import { uploadFile } from '@/service/file';

interface BlobInfo {
  id: () => string;
  name: () => string;
  filename: () => string;
  blob: () => Blob;
  base64: () => string;
  blobUri: () => string;
  uri: () => string | undefined;
}

interface UploadFailureOptions {
  remove?: boolean;
}

type UploadHandler = (
  blobInfo: BlobInfo,
  success: (url: string) => void,
  failure: (err: string, options?: UploadFailureOptions) => void,
  progress?: (percent: number) => void,
) => void;

export const upload: UploadHandler = (blobInfo, success, failure, progress) => {
  const req = uploadFile(blobInfo.blob(), progress, blobInfo.filename());
  req
    .then((res) => {
      success(res.url);
    })
    .catch((err) => {
      failure(err.message);
    });
};
