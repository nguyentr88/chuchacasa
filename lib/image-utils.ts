export const compressImage = async (
  file: File,
  maxWidth = 1200,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Tính toán tỷ lệ khung hình
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        // Vẽ lên canvas để resize
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Cannot get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Chuyển đổi canvas về dạng Blob/File
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Tạo một file mới từ Blob
              const newFile = new File([blob], file.name, {
                type: "image/jpeg", // Ép về JPEG để nén tốt nhất
                lastModified: Date.now(),
              });
              resolve(newFile);
            } else {
              reject(new Error("Canvas to Blob failed"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
