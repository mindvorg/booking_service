import React, { useState, useEffect } from 'react';
import './SearchField.scss';

interface SearchProps {
	onSearch: (searchParams: URLSearchParams) => void;
	initialParams?: Record<string, string>;
}

export const SearchField: React.FC<SearchProps> = ({ onSearch, initialParams }) => {
	const [params, setParams] = useState({
		status: '',
		district: '',
		minSquare: '',
		maxSquare: '',
		minRooms: '',
		maxRooms: '',
		minFloor: '',
		maxFloor: '',
		minPrice: '',
		maxPrice: '',
		minHouseDate: '',
		maxHouseDate: '',
		sort: '',
	});

	// Инициализация начальных параметров из пропсов
	useEffect(() => {
		if (initialParams) {
			setParams(prev => ({
				...prev,
				...initialParams
			}));
		}
	}, [initialParams]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setParams(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Собираем параметры, которые не пустые
		const searchParams = new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			if (value !== '' && value !== null && value !== undefined) {
				searchParams.append(key, value);
			}
		});

		onSearch(searchParams);
	};

	const handleReset = () => {
		setParams({
			status: '',
			district: '',
			minSquare: '',
			maxSquare: '',
			minRooms: '',
			maxRooms: '',
			minFloor: '',
			maxFloor: '',
			minPrice: '',
			maxPrice: '',
			minHouseDate: '',
			maxHouseDate: '',
			sort: '',
		});

		// При сбросе отправляем пустые параметры
		onSearch(new URLSearchParams());
	};

	return (
		<form className="search-form" onSubmit={handleSubmit}>
			<div className="search-container">
				{/* Секция основных фильтров */}
				<div className="filter-section">
					<div className="form-group">
						<label className="input-label">Тип сделки</label>
						<select
							className="select-field"
							name="status"
							value={params.status}
							onChange={handleInputChange}
						>
							<option value="">Все</option>
							<option value="0">Покупка</option>
							<option value="1">Аренда</option>
						</select>
					</div>

					<div className="form-group">
						<label className="input-label">Район</label>
						<input
							className="text-input"
							type="text"
							name="district"
							placeholder="Например: Купчино"
							value={params.district}
							onChange={handleInputChange}
						/>
					</div>

					<div className="form-group">
						<label className="input-label">Сортировка</label>
						<select
							className="select-field"
							name="sort"
							value={params.sort}
							onChange={handleInputChange}
						>
							<option value="">Без сортировки</option>
							<option value="ASC">Цена по возрастанию</option>
							<option value="DESC">Цена по убыванию</option>
						</select>
					</div>
				</div>

				{/* Секция числовых диапазонов */}
				<div className="range-section">
					<div className="range-group">
						<div className="range-label">Площадь (м²)</div>
						<div className="range-inputs">
							<input
								className="number-input"
								type="number"
								name="minSquare"
								placeholder="от"
								value={params.minSquare}
								onChange={handleInputChange}
								min="0"
							/>
							<span className="dash">-</span>
							<input
								className="number-input"
								type="number"
								name="maxSquare"
								placeholder="до"
								value={params.maxSquare}
								onChange={handleInputChange}
								min="0"
							/>
						</div>
					</div>

					<div className="range-group">
						<div className="range-label">Комнаты</div>
						<div className="range-inputs">
							<input
								className="number-input"
								type="number"
								name="minRooms"
								placeholder="от"
								value={params.minRooms}
								onChange={handleInputChange}
								min="0"
							/>
							<span className="dash">-</span>
							<input
								className="number-input"
								type="number"
								name="maxRooms"
								placeholder="до"
								value={params.maxRooms}
								onChange={handleInputChange}
								min="0"
							/>
						</div>
					</div>

					<div className="range-group">
						<div className="range-label">Этаж</div>
						<div className="range-inputs">
							<input
								className="number-input"
								type="number"
								name="minFloor"
								placeholder="от"
								value={params.minFloor}
								onChange={handleInputChange}
								min="0"
							/>
							<span className="dash">-</span>
							<input
								className="number-input"
								type="number"
								name="maxFloor"
								placeholder="до"
								value={params.maxFloor}
								onChange={handleInputChange}
								min="0"
							/>
						</div>
					</div>

					<div className="range-group">
						<div className="range-label">Цена (руб.)</div>
						<div className="range-inputs">
							<input
								className="number-input"
								type="number"
								name="minPrice"
								placeholder="от"
								value={params.minPrice}
								onChange={handleInputChange}
								min="0"
							/>
							<span className="dash">-</span>
							<input
								className="number-input"
								type="number"
								name="maxPrice"
								placeholder="до"
								value={params.maxPrice}
								onChange={handleInputChange}
								min="0"
							/>
						</div>
					</div>

					<div className="range-group">
						<div className="range-label">Год постройки</div>
						<div className="range-inputs">
							<input
								className="number-input"
								type="number"
								name="minHouseDate"
								placeholder="от"
								value={params.minHouseDate}
								onChange={handleInputChange}
								min="0"
								max="2100"
							/>
							<span className="dash">-</span>
							<input
								className="number-input"
								type="number"
								name="maxHouseDate"
								placeholder="до"
								value={params.maxHouseDate}
								onChange={handleInputChange}
								min="0"
								max="2100"
							/>
						</div>
					</div>
				</div>

				{/* Кнопки действий */}
				<div className="action-section">
					<button className="reset-button" type="button" onClick={handleReset}>
						Сбросить фильтры
					</button>
					<button className="search-button" type="submit">
						<span className="search-icon">🔍</span>
						Найти квартиры
					</button>
				</div>
			</div>
		</form>
	);
};