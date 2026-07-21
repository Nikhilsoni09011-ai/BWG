import { get, set } from 'idb-keyval';

const compressImage = async (file: File): Promise<Blob> => {
  if (!file.type.startsWith('image/')) return file;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      const MAX_SIZE = 1200;
      if (width > height && width > MAX_SIZE) {
        height *= MAX_SIZE / width;
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width *= MAX_SIZE / height;
        height = MAX_SIZE;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);
      
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) {
          // Check if we managed to compress it
          if (blob.size < file.size) {
            resolve(blob);
          } else {
            resolve(file); // If somehow bigger, use original
          }
        } else {
          resolve(file);
        }
      }, 'image/jpeg', 0.8);
    };
    img.onerror = () => resolve(file);
  });
};

export const saveFile = async (id: string, file: File): Promise<string> => {
  const fileToSave = await compressImage(file);
  await set(id, fileToSave);
  return `idb://${id}`;
};

export const getFile = async (id: string): Promise<File | Blob | undefined> => {
  return await get(id);
};

export const getFileUrl = async (idbUrl: string): Promise<string | null> => {
  if (!idbUrl.startsWith('idb://')) return null;
  const id = idbUrl.replace('idb://', '');
  const file = await getFile(id);
  if (!file) return null;
  return URL.createObjectURL(file);
};

export const getFileBase64 = async (idbUrl: string): Promise<string | null> => {
  if (!idbUrl.startsWith('idb://')) return idbUrl;
  const id = idbUrl.replace('idb://', '');
  const file = await getFile(id);
  if (!file) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
