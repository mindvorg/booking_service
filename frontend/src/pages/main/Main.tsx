import './Main.scss';
// Main.tsx
import { useState, useEffect } from "react";
import { ApartmentCard, ApartmentCardSkeleton, SearchField } from "../../widget/";

interface Apartment {
	id: number;
	title: string;
	price: number;
	area: number;
	image: string;
}

export const Main = () => {
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
			const mockApartments: Apartment[] = Array.from({ length: 10 }, (_, index) => ({
				id: index + 1,
				title: `Квартира в центре ${index + 1}`,
				price: 5000000 + (index * 100000),
				area: 45 + (index * 5),
				image: `/img/123.webp`,
			}));

			// Фильтрация по поисковому запросу
			const filteredApartments = searchParams
				? mockApartments.filter(apartment =>
					apartment.title.toLowerCase().includes(searchParams.toLowerCase())
				)
				: mockApartments;

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

			<div className="apartments-list">
				{loading ? (
					// Скелетоны во время загрузки
					Array.from({ length: 10 }).map((_, index) => (
						<ApartmentCardSkeleton key={`skeleton-${index}`} />
					))
				) : (
					// Карточки квартир
					apartments.map(apartment => (
						<ApartmentCard key={apartment.id} apartment={apartment} />
					))
				)}
			</div>
		</div>
	);
};