
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

	const regex = /\/photos\/([^\/?#]+)(?:[?#].*)?$/;

	const names = photos.map(url => {
		const match = url.match(regex);
		return match ? match[1] : '';
	}).filter(Boolean);

	const res = await fetch("http://localhost:8080/photo/delete", {
		method: "POST",
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(names),
	});

	if (!res.ok) throw new Error("Не удалось удалить фотографии");
}

export async function createAraptment(payload: any): Promise<any> {

	const res = await fetch("http://localhost:8080/apartments/add", {
		method: "POST",
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	if (!res.ok) throw new Error("Ошибка создания объявления");
}

export async function editAraptment(payload: any): Promise<any> {

	const res = await fetch(`http://localhost:8080/apartments/${payload.id}`, {
		method: "PATCH",
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});

	if (!res.ok) throw new Error("Ошибка редактирования объявления");
}