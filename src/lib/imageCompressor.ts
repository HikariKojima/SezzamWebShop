/**
 * Client-side image compressor using HTML Canvas.
 * Automatically resizes large images (e.g. 10MB+ smartphone photos)
 * and compresses them to clean WebP/JPEG formats (~200-500 KB),
 * preventing Vercel 413 Function Payload Too Large errors.
 */

export interface CompressionOptions {
	maxDimension?: number;
	quality?: number;
}

export async function compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
	const { maxDimension = 1600, quality = 0.82 } = options;

	// Only process raster images; leave SVGs or gifs alone
	if (
		!file.type.startsWith('image/') ||
		file.type === 'image/svg+xml' ||
		file.type === 'image/gif'
	) {
		return file;
	}

	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onerror = () => {
			reject(new Error('Neuspješno čitanje odabrane datoteke.'));
		};

		reader.onload = () => {
			const img = new Image();

			img.onerror = () => {
				reject(new Error('Datoteka nije ispravna slika ili je oštećena.'));
			};

			img.onload = () => {
				let width = img.naturalWidth || img.width;
				let height = img.naturalHeight || img.height;

				if (width === 0 || height === 0) {
					reject(new Error('Slika ima neispravne dimenzije.'));
					return;
				}

				// Scale down proportionally if larger than maxDimension
				if (width > maxDimension || height > maxDimension) {
					if (width > height) {
						height = Math.round((height * maxDimension) / width);
						width = maxDimension;
					} else {
						width = Math.round((width * maxDimension) / height);
						height = maxDimension;
					}
				}

				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext('2d');
				if (!ctx) {
					// Fallback to original file if canvas 2D context is unavailable
					resolve(file);
					return;
				}

				// Ensure crisp image rendering on canvas
				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = 'high';
				ctx.drawImage(img, 0, 0, width, height);

				const outputMimeType = 'image/webp';

				canvas.toBlob(
					(blob) => {
						if (!blob) {
							// Fallback if browser failed to produce blob
							resolve(file);
							return;
						}

						// If compressed blob is unexpectedly larger than original (e.g. already compressed tiny image), keep original
						if (blob.size >= file.size) {
							resolve(file);
							return;
						}

						// Generate clean filename with .webp extension
						const baseName = file.name.replace(/\.[^/.]+$/, '').trim() || 'proizvod';
						const newFileName = `${baseName}.webp`;

						const compressedFile = new File([blob], newFileName, {
							type: outputMimeType,
							lastModified: Date.now()
						});

						resolve(compressedFile);
					},
					outputMimeType,
					quality
				);
			};

			img.src = reader.result as string;
		};

		reader.readAsDataURL(file);
	});
}
