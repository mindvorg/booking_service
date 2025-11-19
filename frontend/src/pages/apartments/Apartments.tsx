import './Apartments.scss';
// Main.tsx
import { useState, useEffect } from "react";
import { ApartmentsList, SearchField } from "../../widget/";
import { mockApartments } from '../../shared/mock/mock';
import type { Apartment } from '../../shared/types/types';

export const Apartments = () => {
	const [apartments, setApartments] = useState<Apartment[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [searchParams, setSearchParams] = useState<string>("");

	// Загрузка данных при монтировании и изменении параметров поиска
	useEffect(() => {
		fetchApartments();
	}, [searchParams]);

	const fetchApartments = async () => {
		setLoading(true);
		try {
			// Имитация задержки API
			await new Promise(resolve => setTimeout(resolve, 1000));

			// Mock данные
			const mock = mockApartments;

			// Фильтрация по поисковому запросу
			const filteredApartments = searchParams
				? mock.filter(apartment =>
					apartment.description.toLowerCase().includes(searchParams.toLowerCase())
				)
				: mock;

			setApartments(filteredApartments);
		} catch (error) {
			console.error("Ошибка загрузки данных:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (searchTerm: string) => {
		setSearchParams(searchTerm);
	};

	const handleReset = () => {
		setSearchParams("");
	};

	return (
		<div className="main">
			<SearchField
				onSearch={handleSearch}
				onReset={handleReset}
				placeholder="Город, ЖК, адрес, район..."
				className="main-search"
			/>

			<ApartmentsList apartments={apartments} loading={loading} />
		</div>
	);
};