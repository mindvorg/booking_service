
import { NavLink } from 'react-router-dom';
import type { Apartment } from '../../shared/types/types';
import { ApartmentCard, ApartmentCardSkeleton } from "../../widget/";
import "./ApartmentsList.scss";

interface ApartmentsListProps {
	apartments: Apartment[];
	loading: boolean;
}

export const ApartmentsList = ({ apartments, loading }: ApartmentsListProps) => {

	return (
		<div className="apartments-list">
			{loading ? (
				// Скелетоны во время загрузки
				Array.from({ length: 10 }).map((_, index) => (
					<ApartmentCardSkeleton key={`skeleton-${index}`} />
				))
			) : (
				// Карточки квартир
				apartments.map(apartment => (
					<NavLink to={`/apartments/${apartment.id}`} key={apartment.id}>
						<ApartmentCard key={apartment.id} apartment={apartment} />
					</NavLink>
				))
			)}
		</div>
	);
};
