import type { PhotoItem } from '../../../shared/types/types';

export async function uploadPhotos(photos: PhotoItem[]): Promise<string[]> {
	const form = new FormData();
	photos.forEach((p) => p.file && form.append("files", p.file));

	const res = await fetch("http://localhost:8080/foto/upload", {
		method: "POST",
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
		},
		body: form,
	});

	if (!res.ok) throw new Error("Не удалось загрузить фотографии");

	const data = await res.json();
	return data.urls as string[];
}

export async function deletePhoto(photos: PhotoItem[]): Promise<string[]> {
	const form = new FormData();
	photos.forEach((p) => p.file && form.append("files", p.file));

	const res = await fetch("/foto/delete", {
		method: "POST",
		body: form,
	});

	if (!res.ok) throw new Error("Не удалось загрузить фотографии");

	const data = await res.json();
	return data.urls as string[];
}

export async function createAraptment(payload: any): Promise<any> {

	const res = await fetch("/api/apartments", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) throw new Error("Ошибка создания объявления");
}