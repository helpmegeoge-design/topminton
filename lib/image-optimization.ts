/**
 * Resize and compress an image file manually using Canvas API
 */
export async function compressImage(file: File, maxWidth = 1024, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        // Check if it's an image
        if (!file.type.match(/image.*/)) {
            reject(new Error("File is not an image"));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                // Draw image
                // Browser usually handles EXIF orientation automatically when drawing to canvas from an Image element
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to Blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Compression failed"));
                            return;
                        }

                        // Convert Blob back to File
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg', // Always convert to JPEG for consistency
                            lastModified: Date.now(),
                        });

                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                );
            };

            img.onerror = (err) => reject(err);
        };

        reader.onerror = (err) => reject(err);
    });
}
