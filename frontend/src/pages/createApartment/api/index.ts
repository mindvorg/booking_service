import type { PhotoItem } from '../../../shared/types/types';

export async function uploadPhotos(photos: File[]): Promise<string[]> {
	const form = new FormData();
	photos.forEach((p) => p && form.append("files", p));

	const res = await fetch("http://localhost:8080/photo/upload", {
		method: "POST",
		body: form,
	});

	if (!res.ok) throw new Error("Не удалось загрузить фотографии");

	const data = await res.json();
	return data as string[];
}

export async function deletePhoto(photos: string[]): Promise<void> {

	const res = await fetch("http://localhost:8080/photo/delete", {
		method: "DELETE",
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
		},
		body: JSON.stringify(photos),
	});

	if (!res.ok) throw new Error("Не удалось удалить фотографии");
}

export async function createAraptment(payload: any): Promise<any> {

	const res = await fetch("/api/apartments", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!res.ok) throw new Error("Ошибка создания объявления");
}