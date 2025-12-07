import './Apartments.scss';
import { useState, useEffect } from "react";
import { ApartmentsList, SearchField } from "../../widget/";
import type { Apartment } from '../../shared/types/types';
import { useNavigate, useLocation } from 'react-router-dom';

export const Apartments = () => {
	const [apartments, setApartments] = useState<Apartment[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const navigate = useNavigate();
	const location = useLocation();

	// Функция для загрузки данных по текущему URL
	const fetchApartmentsFromUrl = async (searchParams: URLSearchParams) => {
		setLoading(true);
		try {
			// Формируем URL для запроса
			const queryString = searchParams.toString();
			const apiUrl = queryString
				? `http://localhost:8080/apartments/search?${queryString}`
				: 'http://localhost:8080/apartments/all';

			console.log('Fetching from:', apiUrl);

			const response = await fetch(apiUrl);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			setApartments(data);
		} catch (error) {
			console.error("Ошибка загрузки данных:", error);
			setApartments([]);
		} finally {
			setLoading(false);
		}
	};

	// При монтировании загружаем данные на основе текущего URL
	useEffect(() => {
		const searchParams = new URLSearchParams(location.search);
		fetchApartmentsFromUrl(searchParams);
	}, [location.search]);

	// Функция для получения начальных параметров из URL
	const getInitialParamsFromUrl = () => {
		const searchParams = new URLSearchParams(location.search);
		const initialParams: Record<string, string> = {};

		// Параметры, которые используются в SearchField
		const paramNames = [
			'status', 'district', 'minSquare', 'maxSquare', 'minRooms',
			'maxRooms', 'minFloor', 'maxFloor', 'minPrice', 'maxPrice',
			'minHouseDate', 'maxHouseDate', 'sort'
		];

		paramNames.forEach(param => {
			const value = searchParams.get(param);
			if (value !== null) {
				initialParams[param] = value;
			}
		});

		return initialParams;
	};

	const handleSearch = (searchParams: URLSearchParams) => {
		// Обновляем URL браузера
		const queryString = searchParams.toString();
		const newPath = queryString ? `/apartments?${queryString}` : '/apartments/all';

		// Используем replace вместо push, чтобы не копить историю поиска
		navigate(newPath, { replace: true });
	};

	return (
		<div className="main">
			<SearchField
				onSearch={handleSearch}
				initialParams={getInitialParamsFromUrl()}
			/>

			{apartments.length === 0 && !loading ? (
				<div className="no-results">
					<h3>Ничего не найдено</h3>
					<p>Попробуйте изменить параметры поиска</p>
				</div>
			) : (
				<ApartmentsList apartments={apartments} loading={loading} />
			)}
		</div>
	);
};