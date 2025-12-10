import { useParams, Navigate, useNavigate, NavLink } from 'react-router-dom';
import { useContext, useEffect, useState, type ChangeEvent } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import './Apartment.scss';
import { Context } from '../../app/main';
import type { IApartFeedback, IUser, Apartment as UApartment } from '../../shared/types/types';
import { createFeedbackApartment, deleteApartmentById, getAgentById, getApartmentById, getFeedbackApartmentById } from '../../shared/api';
import { uploadPhotos } from '../createApartment/api';

// Тип для фото в модальном окне
type PhotoItem = {
	file?: File;
	url: string;
	name: string;
	sizeText: string;
	isExisting: boolean;
};

// Пропсы для модального окна отзыва
type FeedbackModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (feedbackData: { text: string; photos?: File[]; }) => Promise<void>;
};

// Компонент модального окна для добавления отзыва
const FeedbackModal = ({ isOpen, onClose, onSubmit }: FeedbackModalProps) => {
	const [text, setText] = useState('');
	const [photos, setPhotos] = useState<PhotoItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const formatSize = (size: number) => {
		if (size < 1024) return `${size} B`;
		if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
		return `${(size / (1024 * 1024)).toFixed(2)} MB`;
	};

	const validatePhotos = (files: File[]): File[] => {
		const imageFiles = files.filter(f => f.type.startsWith("image/"));
		if (imageFiles.length !== files.length) {
			alert("Можно загружать только изображения (image/*)");
			return [];
		}

		const MAX_FILES = 10;
		if (photos.length + imageFiles.length > MAX_FILES) {
			alert(`Можно загрузить не более ${MAX_FILES} фотографий.`);
			return [];
		}

		const MAX_FILE_SIZE_MB = 2;
		const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
		const validSizeFiles = imageFiles.filter(f => f.size <= MAX_FILE_SIZE);
		if (validSizeFiles.length !== imageFiles.length) {
			alert(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB}MB.`);
		}

		return validSizeFiles;
	};

	const handleAddPhotos = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const validated = validatePhotos(Array.from(files));
		if (!validated.length) return;

		const arr = validated.map(file => ({
			file,
			url: URL.createObjectURL(file),
			name: file.name,
			sizeText: formatSize(file.size),
			isExisting: false,
		}));

		setPhotos(prev => [...prev, ...arr]);
		e.currentTarget.value = "";
	};

	const removePhoto = (index: number) => {
		setPhotos(prev => {
			const copy = [...prev];
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
		const validated = validatePhotos(files);
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

	const handleSubmit = async () => {
		if (!text.trim()) {
			setError('Введите текст отзыва');
			return;
		}

		setLoading(true);
		setError('');

		try {
			const newPhotos = photos.filter(p => !p.isExisting && p.file);
			await onSubmit({
				text: text.trim(),
				photos: newPhotos.length > 0 ? newPhotos.map(p => p.file) as File[] : undefined
			});

			// Очищаем форму после успешной отправки
			setText('');
			setPhotos([]);
			onClose();
		} catch (err) {
			setError('Ошибка при отправке отзыва');
			console.error('Error submitting feedback:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		// Очищаем все Object URL
		photos.forEach(photo => {
			if (!photo.isExisting) {
				URL.revokeObjectURL(photo.url);
			}
		});

		setText('');
		setPhotos([]);
		setError('');
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={handleCancel}>
			<div className=" feedback-modal apart" onClick={(e) => e.stopPropagation()}>
				<h2>Добавить отзыв</h2>

				{error && (
					<div className="error-message">
						{error}
					</div>
				)}

				<div className="form-row">
					<label className="field-label required">
						Текст отзыва
					</label>
					<textarea
						className="field-input textarea"
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Напишите ваш отзыв о квартире..."
						rows={5}
						disabled={loading}
					/>
				</div>

				{/* --- Фото (необязательное поле) --- */}
				<div className="form-row">
					<label className="field-label">
						Фотографии
					</label>
					<div className="field-input">
						<div className="photo-actions">
							<label className={`btn add-photos-modal ${loading ? 'disabled' : ''}`}>
								Добавить фотографии
								<input
									type="file"
									multiple
									accept="image/*"
									onChange={handleAddPhotos}
									disabled={loading}
								/>
							</label>
							<div
								className="drop-zone feedback"
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
										<div className="photo-name" title={p.name}>
											{p.name.substring(0, 10)}
											{p.name.length > 10 && "..."}
										</div>
										<div className="photo-size">{p.sizeText}</div>
										{p.isExisting && <div className="photo-status">На сервере</div>}
									</div>
									<button
										className="btn remove"
										onClick={() => removePhoto(i)}
										aria-label={`Удалить ${p.name}`}
										disabled={loading}
									>
										✕
									</button>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="modal-actions">
					<button
						className="btn btn-cancel"
						onClick={handleCancel}
						disabled={loading}
					>
						Отмена
					</button>
					<button
						className="btn btn-submit"
						onClick={handleSubmit}
						disabled={!text.trim() || loading}
					>
						{loading ? 'Отправка...' : 'Добавить отзыв'}
					</button>
				</div>
			</div>
		</div>
	);
};

export const Apartment = () => {
	const { id } = useParams<{ id: string; }>();
	const { store } = useContext(Context);
	const [apartment, setApartment] = useState<UApartment | null>(null);
	const [agent, setAgent] = useState<IUser | null>(null);
	const [feedback, setFeedback] = useState<IApartFeedback[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showAddFeedback, setShowAddFeedback] = useState(false);
	const [feedbackLoading, setFeedbackLoading] = useState(false);

	const navigate = useNavigate();

	useEffect(() => {
		// Загрузка данных квартиры
		const fetchApartment = async () => {
			if (!id) {
				setError('ID квартиры не указан');
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);

				// Загружаем квартиру по ID из API
				const apartmentData = await getApartmentById(parseInt(id));
				setApartment(apartmentData);
				console.log(apartmentData.agentId);
				if (apartmentData?.agentId) {
					//Загружаем агента
					const agentData = await getAgentById(apartmentData.agentId);
					setAgent(agentData);
				};
				if (apartmentData?.id) {
					//Загружаем отзывы
					const feedbackData = await getFeedbackApartmentById(apartmentData.id);
					setFeedback(feedbackData);
				}
			} catch (error) {
				console.error('Ошибка загрузки квартиры:', error);
				setError('Не удалось загрузить информацию о квартире');
				setApartment(null);
			} finally {
				setLoading(false);
			}
		};

		fetchApartment();
	}, [id]);

	// Функция для разделения строки с фото
	const parseFeedbackPhotos = (photosString: string | null): string[] => {
		if (!photosString) return [];
		return photosString.split(', ').map(photo => photo.trim());
	};

	// Функция для отправки отзыва
	const handleSubmitFeedback = async (feedbackData: { text: string; photos?: File[]; }) => {
		setFeedbackLoading(true);
		try {
			// 1. Сначала загружаем фото, если они есть
			let uploadedPhotoUrls: string[] = [];
			if (feedbackData.photos && feedbackData.photos.length > 0) {
				uploadedPhotoUrls = await uploadPhotos(feedbackData.photos);
			}

			const params: IApartFeedback = {
				apartId: apartment?.id as number,
				id: 0,
				userId: store.user.id,
				feedbackText: feedbackData.text,
				feedbackPhoto: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls.join(', ') : ''
			};

			// 2. Создаем отзыв
			const newFeedback = await createFeedbackApartment(params);
			console.log(newFeedback);

			// 3. Добавляем новый отзыв в список
			setFeedback(prev => [...prev, newFeedback]);

			return Promise.resolve();
		} catch (error) {
			console.error('Error creating feedback:', error);
			throw error;
		} finally {
			setFeedbackLoading(false);
		}
	};

	if (loading) {
		return <div className="apartment-loading">Загрузка...</div>;
	}

	if (error) {
		return (
			<div className="apartment-error">
				<p>{error}</p>
				<Navigate to="/apartments" replace />
			</div>
		);
	}

	if (!apartment) {
		return <Navigate to="/apartments" replace />;
	}

	const getTitle = (): string => {
		return `${apartment.roomNumber}-комн. квартира, ${apartment.square}м², ${apartment.floor} этаж`;
	};

	const getStatus = (): string => {
		return apartment.status === 0 ? 'Продажа' : 'Аренда';
	};

	const formatPrice = (price: number): string => {
		return price.toLocaleString('ru-RU') + ' ₽';
	};

	// Преобразуем строку фото в массив для слайдера
	const getPhotosArray = (): string[] => {
		if (!apartment.photo || apartment.photo.trim() === '') {
			return ['/placeholder-image.jpg']; // Заглушка если нет фото
		}

		// Разбиваем строку по запятой и удаляем пробелы
		return apartment.photo.split(',').map(photo => photo.trim()).filter(photo => photo.length > 0);
	};

	const goToEdit = () => {
		if (apartment.id) {
			navigate(`/edit-apartment/${apartment.id}`);
		}
	};

	const goToDelete = async () => {
		const isConfirmed = window.confirm("Вы уверены, что хотите удалить эту квартиру? Это действие невозможно отменить.");

		if (isConfirmed && apartment.id) {
			try {
				await deleteApartmentById(apartment.id);

				alert("Квартира успешно удалена!");

				navigate('/apartments');

			} catch (error) {
				console.error("Ошибка при удалении квартиры:", error);
				alert("Не удалось удалить квартиру. Попробуйте еще раз.");
			}
		} else {
			console.log("Удаление отменено пользователем");
		}
	};

	return (
		<div className="apartment-page">
			<div className="apartment-container">
				{/* Основная информация */}
				<div className="apartment-header">
					<h1 className="apartment-title-card">{getTitle()}</h1>
					<div className="apartment-price-card">{formatPrice(apartment.price)}</div>
				</div>

				{/* Галерея и детали */}
				<div className="apartment-content">
					<div className="apartment-gallery">
						<div className="gallery-container">
							<Swiper
								modules={[Navigation, Pagination, Autoplay]}
								navigation={{
									nextEl: '.swiper-button-next',
									prevEl: '.swiper-button-prev',
								}}
								pagination={{
									el: '.swiper-pagination',
									clickable: true,
								}}
								autoplay={{ delay: 5000 }}
								loop={true}
								spaceBetween={30}
								slidesPerView={1}
								className="apartment-swiper"
							>
								{getPhotosArray().map((photo, index) => (
									<SwiperSlide key={index}>
										<div className="photo-container">
											<img
												src={photo}
												alt={`${getTitle()} - фото ${index + 1}`}
												className="apartment-photo"
												loading="lazy"
											/>
										</div>
									</SwiperSlide>
								))}
							</Swiper>

							{/* Кастомные элементы управления */}
							<div className="custom-navigation">
								<div className="swiper-button-prev">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
										<path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</div>
								<div className="swiper-button-next">
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
										<path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</div>
							</div>

							<div className="swiper-pagination"></div>
						</div>
					</div>

					<div className="apartment-details-card">
						{/* Статус */}
						<div className="detail-section">
							<div className='status-badge'>
								Статус: {getStatus()}
							</div>
						</div>

						{/* Основные характеристики */}
						<div className="detail-section">
							<h3>Характеристики</h3>
							<div className="features-grid">
								<div className="feature">
									<span className="feature-label">Площадь</span>
									<span className="feature-value">{apartment.square} м²</span>
								</div>
								<div className="feature">
									<span className="feature-label">Комнат</span>
									<span className="feature-value">{apartment.roomNumber}</span>
								</div>
								<div className="feature">
									<span className="feature-label">Этаж</span>
									<span className="feature-value">{apartment.floor}</span>
								</div>
								<div className="feature">
									<span className="feature-label">Год постройки</span>
									<span className="feature-value">{apartment.houseDate}</span>
								</div>
								<div className="feature">
									<span className="feature-label">Район</span>
									<span className="feature-value">{apartment.district}</span>
								</div>
							</div>
						</div>

						{/* Адрес */}
						<div className="detail-section">
							<h3>Адрес</h3>
							<p className="address-text">{apartment.address}</p>
						</div>

						{/* Описание */}
						<div className="detail-section">
							<h3>Описание</h3>
							<p className="description-text">{apartment.description}</p>
						</div>

						{/* Контакты */}
						<div className="detail-section">
							<h3>Агент</h3>
							<div className="contact-info">
								<div className="agent-info">
									<img src={agent?.avatar} alt={agent?.name} className="agent-avatar" />
									<NavLink to={`/agents/${agent?.agentId}`} className="agent-details">
										<span className="agent-name-in-apart">{agent?.name}, {agent?.companyName}</span>
									</NavLink>
								</div>
								{
									store.user.agentId === agent?.agentId
										? <div className="agent-my-apart">
											<button className="agent-edit-apart" onClick={() => goToEdit()}>
												Редактировать квартиру
											</button>
											<button className="agent-delete-apart" onClick={() => goToDelete()}>
												Удалить квартиру
											</button>
										</div>
										: null
								}
							</div>
						</div>

						{/* Отзывы */}
						<div className="detail-section">
							<div className="section-header">
								<h3>Отзывы</h3>
								{
									store.isAuth ? <button
										className="btn add-feedback-btn"
										onClick={() => setShowAddFeedback(true)}
										disabled={feedbackLoading}
									>
										+ Добавить отзыв
									</button> : null
								}
							</div>

							{feedback.length === 0 ? (
								<p className="no-feedback-text">На квартиру нет отзывов</p>
							) : (
								<div className="feedback-list">
									{feedback.map((item) => {
										const photoList = parseFeedbackPhotos(item.feedbackPhoto);

										return (
											<div key={item.id} className="feedback-item">

												<div className="feedback-text">
													{item.feedbackText}
												</div>

												{photoList.length > 0 && (
													<div className="feedback-photos">
														<div className="photos-label">Фотографии:</div>
														<div className="photos-list">
															{photoList.map((photo, index) => (
																<img src={photo} alt={photo + index} key={index} className="feedback-photos-photo-name" />
															))}
														</div>
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>

						{/* Модальное окно добавления отзыва */}
						<FeedbackModal
							isOpen={showAddFeedback}
							onClose={() => setShowAddFeedback(false)}
							onSubmit={handleSubmitFeedback}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};