import { useState, type ChangeEvent, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import './CreateApartment.scss';
import { createAraptment, uploadPhotos, deletePhoto, editAraptment } from './api';
import type { Apartment, PhotoItem } from '../../shared/types/types';
import { getApartmentById } from '../../shared/api';
import { Context } from '../../app/main';

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

// Ограничения для полей
const MAX_ROOMS = 99;        // Максимум двузначное число
const MAX_SQUARE = 999;      // Максимум трехзначное число
const MAX_FLOOR = 9999;      // Максимум четырехзначное число
const MIN_HOUSE_DATE = 1000; // Минимальный год постройки

const MAX_PRICE = 999999999; // Максимальная цена
const MIN_PRICE = 1;         // Минимальная цена

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

// Функция ограничения значения
const limitValue = (value: number, max: number, min = 0): number => {
	if (value > max) return max;
	if (value < min) return min;
	return value;
};

// Функция проверки заполненности всех обязательных полей
const isFormValid = (formData: Apartment): boolean => {
	const currentYear = new Date().getFullYear();

	return (
		formData.roomNumber > 0 &&
		formData.square > 0 &&
		formData.floor > 0 &&
		formData.price >= MIN_PRICE &&
		formData.price <= MAX_PRICE &&
		formData.houseDate >= MIN_HOUSE_DATE &&
		formData.houseDate <= currentYear &&
		formData.district.trim() !== "" &&
		formData.address.trim() !== "" &&
		formData.description.trim() !== ""
	);
};

export default function CreateApartment() {
	const { id } = useParams<{ id: string; }>();
	const isEdit = Boolean(id);

	const { store } = useContext(Context);

	const [photos, setPhotos] = useState<PhotoItem[]>([]);
	const [deletedPhotos, setDeletedPhotos] = useState<string[]>([]); // Фото, удаленные при редактировании
	const [formData, setFormData] = useState<Apartment>({
		status: 0,
		address: "",
		houseDate: 0,
		floor: 0,
		square: 0,
		roomNumber: 0,
		price: 0,
		agentId: 0,
		photo: '',
		description: "",
		district: "",
	});

	// Получаем текущий год
	const currentYear = new Date().getFullYear();

	// Проверяем валидность формы
	const isFormComplete = isFormValid(formData);

	const formatSize = (size: number) => {
		if (size < 1024) return `${size} B`;
		if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
		return `${(size / (1024 * 1024)).toFixed(2)} MB`;
	};

	// --- Обработчики полей с ограничениями ---
	const handleRoomNumberChange = (value: number) => {
		const limitedValue = limitValue(value, MAX_ROOMS, 0);
		setFormData({ ...formData, roomNumber: limitedValue });
	};

	const handleSquareChange = (value: number) => {
		const limitedValue = limitValue(value, MAX_SQUARE, 0);
		setFormData({ ...formData, square: limitedValue });
	};

	const handleFloorChange = (value: number) => {
		const limitedValue = limitValue(value, MAX_FLOOR, 0);
		setFormData({ ...formData, floor: limitedValue });
	};

	const handleHouseDateChange = (value: number) => {
		// Если значение пустое или не число, устанавливаем 0
		if (isNaN(value) || value === undefined) {
			setFormData({ ...formData, houseDate: 0 });
			return;
		}

		// Если значение меньше минимального года (например, пользователь ввел 2 цифры 19)
		// Не ограничиваем его сразу, пусть пользователь допечатает год
		if (value < MIN_HOUSE_DATE) {
			// Разрешаем ввод частичного значения, но только если оно состоит из 3-4 цифр
			// И не начинается с 0 (чтобы избежать ввода 0999)
			if (value >= 100 && value <= 999) {
				// Пользователь ввел 3 цифры (например, 202)
				setFormData({ ...formData, houseDate: value });
				return;
			}

			if (value >= 10 && value <= 99) {
				// Пользователь ввел 2 цифры (например, 20)
				setFormData({ ...formData, houseDate: value });
				return;
			}

			if (value >= 1 && value <= 9) {
				// Пользователь ввел 1 цифру
				setFormData({ ...formData, houseDate: value });
				return;
			}

			// Если значение слишком маленькое, устанавливаем минимальное
			setFormData({ ...formData, houseDate: MIN_HOUSE_DATE });
			return;
		}

		// Если значение больше максимального года
		if (value > currentYear) {
			// Устанавливаем текущий год как максимальный
			setFormData({ ...formData, houseDate: currentYear });
			return;
		}

		// Нормальное значение в пределах диапазона
		setFormData({ ...formData, houseDate: value });
	};

	const handlePriceChange = (value: number) => {
		// Ограничиваем значение между MIN_PRICE и MAX_PRICE
		const limitedValue = limitValue(value, MAX_PRICE, 0);
		setFormData({ ...formData, price: limitedValue });
	};

	const handleDistrictChange = (value: string) => {
		setFormData({ ...formData, district: value });
	};

	const handleAddressChange = (value: string) => {
		setFormData({ ...formData, address: value });
	};

	const handleDescriptionChange = (value: string) => {
		setFormData({ ...formData, description: value });
	};

	// --- Подгрузка данных для редактирования ---
	useEffect(() => {
		if (!isEdit) return;
		(async () => {
			try {
				const data = await getApartmentById(Number(id));

				// Применяем ограничения при загрузке данных
				const limitedData = {
					...data,
					photo: data.photo || '',
					roomNumber: limitValue(data.roomNumber, MAX_ROOMS, 0),
					square: limitValue(data.square, MAX_SQUARE, 0),
					floor: limitValue(data.floor, MAX_FLOOR, 0),
					houseDate: limitValue(data.houseDate, currentYear, MIN_HOUSE_DATE),
					price: limitValue(data.price, MAX_PRICE, 0)
				};

				setFormData(limitedData);

				if (data.photo) {
					// Разбиваем строку на массив URL
					const photoArray = data.photo.split(',').map((url: string) => url.trim()).filter(url => url.length > 0);

					// Создаем массив фото для отображения
					const initialPhotos = photoArray.map((url: string) => ({
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
			isExisting: false, // Новые фото помечаем как несуществующие
		}));

		setPhotos(prev => [...prev, ...arr]);
		e.currentTarget.value = "";
	};

	const removePhoto = (index: number) => {
		const photoToRemove = photos[index];

		// Если фото существующее (уже загружено на сервер) - добавляем в список для удаления
		if (isEdit && photoToRemove.isExisting && photoToRemove.url) {
			setDeletedPhotos(prev => [...prev, photoToRemove.url]);
		}

		// Удаляем из локального состояния
		setPhotos(prev => {
			const copy = [...prev];
			// Освобождаем память только для новых фото (ObjectURL)
			if (!copy[index].isExisting) {
				URL.revokeObjectURL(copy[index].url);
			}
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
			isExisting: false,
		}));
		setPhotos(prev => [...prev, ...arr]);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

	// --- Создание / редактирование объявления ---
	async function handleSubmit() {
		// Дополнительная проверка перед отправкой
		if (!isFormComplete) {
			alert("Пожалуйста, заполните все обязательные поля");
			return;
		}

		// Проверяем год постройки на финальном этапе
		if (formData.houseDate < MIN_HOUSE_DATE || formData.houseDate > currentYear) {
			alert(`Год постройки должен быть в диапазоне от ${MIN_HOUSE_DATE} до ${currentYear}`);
			return;
		}

		try {
			// --- 1. Удаляем фото с сервера (только для редактирования) ---
			if (isEdit && deletedPhotos.length > 0) {
				try {
					await deletePhoto(deletedPhotos);
					console.log("Фото удалены с сервера:", deletedPhotos);
				} catch (err) {
					console.error("Ошибка при удалении фото с сервера:", err);
					alert("Не удалось удалить некоторые фото с сервера. Попробуйте еще раз.");
					return; // Прерываем если не удалось удалить фото
				}
			}

			// --- 2. Подготовка agentId ---
			formData.agentId = store.user?.agentId ? store.user.agentId : 0;

			// --- 3. Получаем URL существующих фото (те, что не были удалены) ---
			const existingPhotoUrls = photos
				.filter(p => p.isExisting)
				.map(p => p.url);

			// --- 4. Загружаем новые фотографии ---
			const newPhotos = photos
				.filter(p => !p.isExisting && p.file)
				.map(p => p.file as File);

			let allPhotoUrls = [...existingPhotoUrls];

			if (newPhotos.length > 0) {
				const uploadedUrls = await uploadPhotos(newPhotos);
				allPhotoUrls = [...allPhotoUrls, ...uploadedUrls];
			}

			// --- 5. Преобразуем массив URL в строку для отправки на сервер ---
			const photoString = allPhotoUrls.join(', ');

			// --- 6. Создаем payload с строкой фото ---
			const payload = {
				...formData,
				photo: photoString,
				// Если редактируем, добавляем id
				...(isEdit && id && { id: Number(id) })
			};

			console.log("Отправляем данные:", payload);

			// --- 7. Отправляем данные ---
			isEdit ? await editAraptment(payload) : await createAraptment(payload);
			alert(isEdit ? "Объявление успешно обновлено!" : "Объявление успешно создано!");

			// --- 8. Очистка ObjectURL для новых фото ---
			photos.forEach(photo => {
				if (!photo.isExisting) {
					URL.revokeObjectURL(photo.url);
				}
			});

			// Очищаем список удаленных фото после успешного сохранения
			setDeletedPhotos([]);

		} catch (err) {
			console.error("Ошибка при сохранении объявления:", err);
			alert("Ошибка при сохранении объявления");
		}
	}

	// Валидация года при потере фокуса
	const handleHouseDateBlur = () => {
		if (formData.houseDate === 0) {
			// Если поле пустое, устанавливаем текущий год
			setFormData({ ...formData, houseDate: currentYear });
			return;
		}

		if (formData.houseDate < MIN_HOUSE_DATE) {
			// Если значение слишком маленькое, устанавливаем минимальное
			setFormData({ ...formData, houseDate: MIN_HOUSE_DATE });
			return;
		}

		if (formData.houseDate > currentYear) {
			// Если значение больше текущего года, устанавливаем текущий год
			setFormData({ ...formData, houseDate: currentYear });
			return;
		}

		// Если год состоит из 1-3 цифр, дополняем его до 4 цифр на основе логики
		if (formData.houseDate >= 1 && formData.houseDate <= 999) {
			let finalYear = formData.houseDate;

			// Логика дополнения года:
			// 1-99: считаем, что это 19xx или 20xx
			if (finalYear >= 1 && finalYear <= 99) {
				// Если число <= 30, считаем что это 2000-2030
				if (finalYear <= 30) {
					finalYear = 2000 + finalYear;
				}
				// Если число > 30, считаем что это 19xx
				else {
					finalYear = 1900 + finalYear;
				}
			}
			// 100-999: добавляем 1000 или 2000 в зависимости от значения
			else if (finalYear >= 100 && finalYear <= 999) {
				if (finalYear >= 200 && finalYear <= 999) {
					finalYear = 1000 + finalYear; // например, 202 -> 1202, но это неправильно
					// Лучше считать, что 3 цифры - это 19xx или 20xx
					if (finalYear >= 1200 && finalYear <= 1299) {
						finalYear = 2000 + (finalYear - 1000); // 1202 -> 2022
					}
				}
			}

			// Проверяем, что итоговый год в пределах допустимого диапазона
			if (finalYear < MIN_HOUSE_DATE) {
				finalYear = MIN_HOUSE_DATE;
			} else if (finalYear > currentYear) {
				finalYear = currentYear;
			}

			setFormData({ ...formData, houseDate: finalYear });
		}
	};

	return (
		<div className="create-apartment-page">
			<div className="form-card">
				<h1 className="form-title">{isEdit ? "Редактировать объявление" : "Создать объявление"}</h1>

				<div className="required-fields-note">
					<span className="required-star">*</span> - обязательные поля
				</div>

				<div className="form-grid">
					{/* --- Поля с ограничениями --- */}
					<div className="form-row three-cols">
						<div>
							<label className="field-label">
								Комнат (макс. {MAX_ROOMS}) <span className="required-star">*</span>
							</label>
							<div className="field-input">
								<input
									type="number"
									value={formData.roomNumber || ""}
									onChange={e => handleRoomNumberChange(Number(e.target.value))}
									min="1"
									max={MAX_ROOMS}
									required
									className={formData.roomNumber <= 0 ? "field-invalid" : ""}
								/>
								{formData.roomNumber <= 0 && <span className="field-error">Обязательное поле</span>}
							</div>
						</div>
						<div>
							<label className="field-label">
								Площадь (м², макс. {MAX_SQUARE}) <span className="required-star">*</span>
							</label>
							<div className="field-input">
								<input
									type="number"
									value={formData.square || ""}
									onChange={e => handleSquareChange(Number(e.target.value))}
									min="1"
									max={MAX_SQUARE}
									required
									className={formData.square <= 0 ? "field-invalid" : ""}
								/>
								{formData.square <= 0 && <span className="field-error">Обязательное поле</span>}
							</div>
						</div>
						<div>
							<label className="field-label">
								Этаж (макс. {MAX_FLOOR}) <span className="required-star">*</span>
							</label>
							<div className="field-input">
								<input
									type="number"
									value={formData.floor || ""}
									onChange={e => handleFloorChange(Number(e.target.value))}
									min="1"
									max={MAX_FLOOR}
									required
									className={formData.floor <= 0 ? "field-invalid" : ""}
								/>
								{formData.floor <= 0 && <span className="field-error">Обязательное поле</span>}
							</div>
						</div>
					</div>

					<div className="form-row three-cols">
						<div>
							<label className="field-label">
								Цена (₽, макс. {MAX_PRICE.toLocaleString('ru-RU')}) <span className="required-star">*</span>
							</label>
							<div className="field-input">
								<input
									type="number"
									value={formData.price || ""}
									onChange={e => handlePriceChange(Number(e.target.value))}
									min={MIN_PRICE}
									max={MAX_PRICE}
									required
									className={formData.price <= 0 || formData.price > MAX_PRICE ? "field-invalid" : ""}
								/>
								{formData.price <= 0 && <span className="field-error">Обязательное поле</span>}
								{formData.price > MAX_PRICE && (
									<span className="field-error">Максимальная цена: {MAX_PRICE.toLocaleString('ru-RU')} ₽</span>
								)}
							</div>
						</div>

						<div>
							<label className="field-label">
								Статус <span className="required-star">*</span>
							</label>
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
							<label className="field-label">
								Год постройки ({MIN_HOUSE_DATE}-{currentYear}) <span className="required-star">*</span>
							</label>
							<div className="field-input">
								<input
									type="number"
									value={formData.houseDate || ""}
									onChange={e => handleHouseDateChange(Number(e.target.value))}
									onBlur={handleHouseDateBlur}
									min={MIN_HOUSE_DATE}
									max={currentYear}
									required
									className={formData.houseDate < MIN_HOUSE_DATE || formData.houseDate > currentYear ? "field-invalid" : ""}
								/>
								{(formData.houseDate < MIN_HOUSE_DATE || formData.houseDate > currentYear) && (
									<span className="field-error">Допустимый диапазон: {MIN_HOUSE_DATE}-{currentYear}</span>
								)}
							</div>
						</div>
					</div>

					{/* --- Остальные поля: Район, Тип квартиры, Адрес, Описание --- */}
					<div className="form-row">
						<label className="field-label">
							Район <span className="required-star">*</span>
						</label>
						<div className="field-input">
							<input
								type="text"
								value={formData.district}
								onChange={e => handleDistrictChange(e.target.value)}
								required
								className={!formData.district.trim() ? "field-invalid" : ""}
							/>
							{!formData.district.trim() && <span className="field-error">Обязательное поле</span>}
						</div>
					</div>

					<div className="form-row">
						<label className="field-label">
							Адрес <span className="required-star">*</span>
						</label>
						<div className="field-input">
							<input
								type="text"
								placeholder="Улица, дом, корпус"
								value={formData.address}
								onChange={e => handleAddressChange(e.target.value)}
								required
								className={!formData.address.trim() ? "field-invalid" : ""}
							/>
							{!formData.address.trim() && <span className="field-error">Обязательное поле</span>}
						</div>
					</div>

					<div className="form-row">
						<label className="field-label">
							Описание <span className="required-star">*</span>
						</label>
						<div className="field-input">
							<textarea
								rows={5}
								value={formData.description}
								onChange={e => handleDescriptionChange(e.target.value)}
								placeholder="Подробное описание"
								required
								className={!formData.description.trim() ? "field-invalid" : ""}
							/>
							{!formData.description.trim() && <span className="field-error">Обязательное поле</span>}
						</div>
					</div>

					{/* --- Фото (необязательное поле) --- */}
					<div className="form-row">
						<label className="field-label">
							Фотографии
						</label>
						<div className="field-input">
							<div className="photo-actions">
								<label className="btn add-photos create-apart">
									Добавить фотографии
									<input type="file" multiple accept="image/*" onChange={handleAddPhotos} />
								</label>
								<div
									className="drop-zone create-apart"
									onDrop={handleDrop}
									onDragOver={handleDragOver}
								>
									Перетащи фотографии сюда
								</div>
								<div className="photo-hint">Поддерживается несколько файлов. Максимум 10.</div>
							</div>

							<div className="photo-grid">
								{photos.map((p, i) => (
									<div className="photo-item" key={i}>
										<div className="thumb-wrap">
											<img src={p.url} alt={p.name} />
										</div>
										<div className="photo-meta">
											<div className="photo-name" title={p.name}>{p.name.substring(0, 10)}
												{p.name.length > 10 && "..."}</div>
											<div className="photo-size">{p.sizeText}</div>
											{p.isExisting && <div className="photo-status">На сервере</div>}
										</div>
										<button
											className="btn remove"
											onClick={() => removePhoto(i)}
											aria-label={`Удалить ${p.name}`}
										>
											✕
										</button>
									</div>
								))}
							</div>

							{/* Отображение информации об удаленных фото (для отладки) */}
							{isEdit && deletedPhotos.length > 0 && (
								<div className="deleted-info">
									<small>Будет удалено с сервера: {deletedPhotos.length} фото</small>
								</div>
							)}
						</div>
					</div>

					<div className="form-row actions-row">
						<button
							className={`btn submit ${!isFormComplete ? 'btn-disabled' : ''}`}
							onClick={handleSubmit}
							disabled={!isFormComplete}
						>
							{isEdit ? "Сохранить изменения" : "Создать объявление"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}