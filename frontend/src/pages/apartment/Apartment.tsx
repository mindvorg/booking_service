import { useParams, Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import './apartment.scss';
import { Context } from '../../app/main';
import type { Apartment as UApartment } from '../../shared/types/types';
import { mockApartments } from '../../shared/mock/mock';

export const Apartment = () => {
	const { id } = useParams<{ id: string; }>();
	const { store } = useContext(Context);
	const [apartment, setApartment] = useState<UApartment | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Загрузка данных квартиры
		const fetchApartment = async () => {
			if (!id) return;

			try {
				// Здесь будет запрос к API
				// Временно ищем в mock данных
				const foundApartment = mockApartments.find(apt => apt.id === parseInt(id));
				setApartment(foundApartment || null);
			} catch (error) {
				console.error('Ошибка загрузки квартиры:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchApartment();
	}, [id]); // Убрал mockApartments из зависимостей

	if (loading) {
		return <div className="apartment-loading">Загрузка...</div>;
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

	return (
		<div className="apartment-page">
			<div className="apartment-container">
				{/* Основная информация */}
				<div className="apartment-header">
					<h1 className="apartment-title">{getTitle()}</h1>
					<div className="apartment-price">{formatPrice(apartment.price)}</div>
				</div>

				{/* Галерея и детали */}
				<div className="apartment-content">
					<div className="apartment-gallery">
						<Swiper
							modules={[Navigation, Pagination, Autoplay]}
							navigation={true}
							pagination={{ clickable: true }}
							autoplay={{ delay: 5000 }}
							loop={true}
							spaceBetween={10}
							slidesPerView={1}
							className="apartment-swiper"
						>
							{
								apartment.photos.map((photo, index) =>
									<SwiperSlide key={index}>
										<img src={photo} alt={getTitle() + index} />
									</SwiperSlide>
								)
							}
						</Swiper>
					</div>

					<div className="apartment-details-card">
						{/* Статус */}
						<div className="detail-section">
							<div className='status-badge'>
								{getStatus()}
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
								<div className="feature">
									<span className="feature-label">Тип квартиры</span>
									<span className="feature-value">{apartment.apartType}</span>
								</div>
							</div>
						</div>

						{/* Адрес */}
						<div className="detail-section">
							<h3>Адрес</h3>
							<p className="address-text">{apartment.address}</p>
							{apartment.geotag && (
								<button className="map-button">
									📍 Показать на карте
								</button>
							)}
						</div>

						{/* Описание */}
						<div className="detail-section">
							<h3>Описание</h3>
							<p className="description-text">{apartment.description}</p>
						</div>

						{/* Контакты */}
						<div className="detail-section">
							<h3>Контактная информация</h3>
							<div className="contact-info">
								<div className="agent-info">
									<div className="agent-avatar">👤</div>
									<div className="agent-details">
										<span className="agent-name">Агент #{apartment.agentId}</span>
										<span className="agent-phone">+7 (XXX) XXX-XX-XX</span>
									</div>
								</div>
								<button className="contact-button">
									Показать телефон
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};