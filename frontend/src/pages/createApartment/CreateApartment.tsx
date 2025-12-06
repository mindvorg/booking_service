import { useState, type ChangeEvent, useEffect } from "react";
import { useParams } from "react-router-dom";
import './CreateApartment.scss';
import { createAraptment, uploadPhotos, deletePhoto } from './api';
import type { Apartment, PhotoItem } from '../../shared/types/types';
import { getApartmentById } from '../../shared/api';


const MAX_FILES = 20;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

function validatePhotos(files: File[], existingCount: number): File[] {
	const imageFiles = files.filter(f => f.type.startsWith("image/"));

	if (imageFiles.length !== files.length) {
		alert("Можно загружать только изображения (image/*)");
	}

	if (existingCount + imageFiles.length > MAX_FILES) {
		alert(`Можно загрузить не более ${MAX_FILES} фотографий.`);
		return [];
	}

	const validSizeFiles = imageFiles.filter(f => f.size <= MAX_FILE_SIZE);
	if (validSizeFiles.length !== imageFiles.length) {
		alert(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB}MB.`);
	}

	return validSizeFiles;
}

export default function CreateApartment() {
	const { id } = useParams<{ id: string; }>();
	const isEdit = Boolean(id);

	const [photos, setPhotos] = useState<PhotoItem[]>([]);
	const [formData, setFormData] = useState<Apartment>({
		id: 0,
		status: 0,
		address: "",
		houseDate: 0,
		floor: 0,
		square: 0,
		roomNumber: 0,
		price: 0,
		agentId: 0,
		photos: [],
		description: "",
		district: "",
		apartType: "",
		geotag: "",
	});

	const formatSize = (size: number) => {
		if (size < 1024) return `${size} B`;
		if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
		return `${(size / (1024 * 1024)).toFixed(2)} MB`;
	};

	// --- Подгрузка данных для редактирования ---
	useEffect(() => {
		if (!isEdit) return;
		(async () => {
			try {
				const data = await getApartmentById(Number(id));
				setFormData({ ...data, photos: data.photos || [] });

				if (data.photos?.length) {
					const initialPhotos = data.photos.map((url: string) => ({
						file: null,
						url,
						name: url.split("/").pop() || "photo",
						sizeText: "-",
						isExisting: true,
					}));
					setPhotos(initialPhotos);
				}
			} catch (err) {
				console.error("Ошибка загрузки объявления", err);
			}
		})();
	}, [id]);

	// --- Работа с фото ---
	const handleAddPhotos = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const validated = validatePhotos(Array.from(files), photos.length);
		if (!validated.length) return;

		const arr = validated.map(file => ({
			file,
			url: URL.createObjectURL(file),
			name: file.name,
			sizeText: formatSize(file.size),
		}));

		setPhotos(prev => [...prev, ...arr]);
		e.currentTarget.value = "";
	};

	const removePhoto = (index: number) => {
		setPhotos(prev => {
			const copy = [...prev];
			URL.revokeObjectURL(copy[index].url);
			copy.splice(index, 1);
			return copy;
		});
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		const files = Array.from(e.dataTransfer.files);
		const validated = validatePhotos(files, photos.length);
		if (!validated.length) return;

		const arr = validated.map(file => ({
			file,
			url: URL.createObjectURL(file),
			name: file.name,
			sizeText: formatSize(file.size),
		}));
		setPhotos(prev => [...prev, ...arr]);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

	// --- Создание / редактирование объявления ---
	async function createApartment() {
		try {
			// --- 1. Удаляем удалённые фото с сервера (только для редактирования) ---
			const existingPhotos = photos.filter(p => p.isExisting);
			const removedPhotos = formData.photos.filter(p => !existingPhotos.some(ep => ep.url === p));
			for (const url of removedPhotos) {
				await deletePhoto(url);
			}

			// --- 2. Загружаем новые фотографии ---
			const newPhotos = photos.filter(p => !p.isExisting && p.file);
			let finalPhotoUrls: string[] = [];
			if (newPhotos.length) {
				const uploadedUrls = await uploadPhotos(newPhotos); // массив URL
				finalPhotoUrls = [...existingPhotos.map(p => p.url), ...uploadedUrls];
			} else {
				finalPhotoUrls = existingPhotos.map(p => p.url);
			}

			// --- 3. Сохраняем данные ---
			await createAraptment({ ...formData, photos: finalPhotoUrls });
			alert("Объявление успешно сохранено!");
		} catch (err) {
			console.error(err);
			alert("Ошибка при сохранении объявления");
		}
	}

	return (
		<div className="create-apartment-page">
			<div className="form-card">
				<h1 className="form-title">{isEdit ? "Редактировать объявление" : "Создать объявление"}</h1>

				<div className="form-grid">
					{/* --- Поля как у тебя --- */}
					<div className="form-row three-cols">
						<div>
							<label className="field-label">Комнат</label>
							<div className="field-input">
								<input
									type="number"
									value={formData.roomNumber}
									onChange={e => setFormData({ ...formData, roomNumber: Number(e.target.value) })}
								/>
							</div>
						</div>
						<div>
							<label className="field-label">Площадь (м²)</label>
							<div className="field-input">
								<input
									type="number"
									value={formData.square}
									onChange={e => setFormData({ ...formData, square: Number(e.target.value) })}
								/>
							</div>
						</div>
						<div>
							<label className="field-label">Этаж</label>
							<div className="field-input">
								<input
									type="number"
									value={formData.floor}
									onChange={e => setFormData({ ...formData, floor: Number(e.target.value) })}
								/>
							</div>
						</div>
					</div>

					<div className="form-row three-cols">
						<div>
							<label className="field-label">Цена (₽)</label>
							<div className="field-input">
								<input
									type="number"
									value={formData.price}
									onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
								/>
							</div>
						</div>

						<div>
							<label className="field-label">Статус</label>
							<div className="field-input">
								<select
									value={formData.status}
									onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
								>
									<option value={0}>Продажа</option>
									<option value={1}>Аренда</option>
								</select>
							</div>
						</div>

						<div>
							<label className="field-label">Год постройки</label>
							<div className="field-input">
								<input
									type="number"
									value={formData.houseDate}
									onChange={e => setFormData({ ...formData, houseDate: Number(e.target.value) })}
								/>
							</div>
						</div>
					</div>

					{/* --- Остальные поля: Район, Тип квартиры, Адрес, Описание --- */}
					<div className="form-row">
						<label className="field-label">Район</label>
						<div className="field-input">
							<input
								type="text"
								value={formData.district}
								onChange={e => setFormData({ ...formData, district: e.target.value })}
							/>
						</div>
					</div>

					<div className="form-row">
						<label className="field-label">Тип квартиры</label>
						<div className="field-input">
							<input
								type="text"
								placeholder="Студия, Хрущёвка, Новостройка"
								value={formData.apartType}
								onChange={e => setFormData({ ...formData, apartType: e.target.value })}
							/>
						</div>
					</div>

					<div className="form-row">
						<label className="field-label">Адрес</label>
						<div className="field-input">
							<input
								type="text"
								placeholder="Улица, дом, корпус"
								value={formData.address}
								onChange={e => setFormData({ ...formData, address: e.target.value })}
							/>
						</div>
					</div>

					<div className="form-row">
						<label className="field-label">Описание</label>
						<div className="field-input">
							<textarea
								rows={5}
								value={formData.description}
								onChange={e => setFormData({ ...formData, description: e.target.value })}
								placeholder="Подробное описание"
							/>
						</div>
					</div>

					{/* --- Фото --- */}
					<div className="form-row">
						<label className="field-label">Фотографии</label>
						<div className="field-input">
							<div className="photo-actions">
								<label className="btn add-photos">
									Добавить фотографии
									<input type="file" multiple accept="image/*" onChange={handleAddPhotos} />
								</label>
								<div
									className="drop-zone"
									onDrop={handleDrop}
									onDragOver={handleDragOver}
								>
									Перетащи фотографии сюда
								</div>
								<div className="photo-hint">Поддерживается несколько файлов. Максимум 20.</div>
							</div>

							<div className="photo-grid">
								{photos.map((p, i) => (
									<div className="photo-item" key={i}>
										<div className="thumb-wrap">
											<img src={p.url} alt={p.name} />
										</div>
										<div className="photo-meta">
											<div className="photo-name" title={p.name}>{p.name}</div>
											<div className="photo-size">{p.sizeText}</div>
										</div>
										<button className="btn remove" onClick={() => removePhoto(i)} aria-label={`Удалить ${p.name}`}>✕</button>
									</div>
								))}
							</div>
						</div>
					</div>

					<div className="form-row actions-row">
						<button className="btn submit" onClick={createApartment}>
							{isEdit ? "Сохранить изменения" : "Создать объявление"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
