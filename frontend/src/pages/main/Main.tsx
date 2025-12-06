import { useNavigate } from 'react-router-dom';
import './Main.scss';

export const Main = () => {
	const navigate = useNavigate();

	const handleNavigateToApartments = () => {
		navigate('/apartments');
	};

	return (
		<div className="main-page">
			<section className="hero-section">
				<div className="hero-content">
					<h1 className="hero-title">Найдите свою идеальную квартиру</h1>
					<p className="hero-subtitle">
						Современное жилье в лучших районах города по доступным ценам
					</p>
					<button
						className="hero-button"
						onClick={handleNavigateToApartments}
					>
						Смотреть все квартиры
					</button>
				</div>
				<div className="hero-image">
					<div className="placeholder-image">Изображение жилого комплекса</div>
				</div>
			</section>

			<section className="features-section">
				<h2 className="section-title">Почему выбирают нас</h2>
				<div className="features-grid">
					<div className="feature-card">
						<div className="feature-icon">🏠</div>
						<h3>Широкий выбор</h3>
						<p>Более 1000 квартир в разных районах города</p>
					</div>
					<div className="feature-card">
						<div className="feature-icon">💰</div>
						<h3>Выгодные цены</h3>
						<p>Прямые договоры с застройщиками без комиссий</p>
					</div>
					<div className="feature-card">
						<div className="feature-icon">⚡</div>
						<h3>Быстрая сделка</h3>
						<p>Оформление документов за 1 день</p>
					</div>
					<div className="feature-card">
						<div className="feature-icon">🛡️</div>
						<h3>Юридическая поддержка</h3>
						<p>Полное сопровождение сделки опытными юристами</p>
					</div>
				</div>
			</section>

			<section className="process-section">
				<h2 className="section-title">Как мы работаем</h2>
				<div className="process-steps">
					<div className="process-step">
						<div className="step-number">1</div>
						<h3>Подбор вариантов</h3>
						<p>Мы подберем для вас лучшие варианты по вашим критериям</p>
					</div>
					<div className="process-step">
						<div className="step-number">2</div>
						<h3>Просмотр объектов</h3>
						<p>Организуем просмотр выбранных квартир в удобное время</p>
					</div>
					<div className="process-step">
						<div className="step-number">3</div>
						<h3>Оформление сделки</h3>
						<p>Поможем с оформлением всех необходимых документов</p>
					</div>
					<div className="process-step">
						<div className="step-number">4</div>
						<h3>Получение ключей</h3>
						<p>Вы получаете ключи от своей новой квартиры</p>
					</div>
				</div>
			</section>

			<section className="cta-section">
				<div className="cta-content">
					<h2>Готовы найти свой дом?</h2>
					<p>Начните поиск прямо сейчас и найдите квартиру мечты</p>
					<button
						className="cta-button"
						onClick={handleNavigateToApartments}
					>
						Начать поиск
					</button>
				</div>
			</section>
		</div>
	);
};