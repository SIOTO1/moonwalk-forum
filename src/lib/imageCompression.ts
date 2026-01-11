interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  maxSizeKB: 500,
};

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { maxWidth, maxHeight, quality, maxSizeKB } = { ...DEFAULT_OPTIONS, ...options };

  // Skip compression for small images or non-compressible formats
  if (file.size < (maxSizeKB! * 1024) && !file.type.includes('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth! || height > maxHeight!) {
          const ratio = Math.min(maxWidth! / width, maxHeight! / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Determine output format - use webp for better compression if supported
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        
        // Try to compress to target size
        let currentQuality = quality!;
        
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not compress image'));
                return;
              }

              // If still too large and quality can be reduced, try again
              if (blob.size > maxSizeKB! * 1024 && currentQuality > 0.3) {
                currentQuality -= 0.1;
                tryCompress();
                return;
              }

              // Create new file with original name
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, outputType === 'image/png' ? '.png' : '.jpg'),
                { type: outputType }
              );
              
              console.log(
                `Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`
              );
              
              resolve(compressedFile);
            },
            outputType,
            currentQuality
          );
        };
        
        tryCompress();
      };

      img.onerror = () => {
        reject(new Error('Could not load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Could not read file'));
    };

    reader.readAsDataURL(file);
  });
}

export async function compressImages(
  files: File[],
  options?: CompressionOptions
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}
