// ApartmentCard.tsx
import type { Apartment } from '../../shared/types/types';
import "./ApartmentCard.scss";

interface ApartmentCardProps {
	apartment: Apartment;
}

export const ApartmentCard = ({ apartment }: ApartmentCardProps) => {

	const getTitle = (): string => {
		return `${apartment.roomNumber}-комн. квартира\u00A0\u00A0${apartment.square}м²\u00A0\u00A0${apartment.floor} этаж`;
	};

	return (
		<div className="apartment-card">
			<div className="apartment-image">
				<img src={apartment.photo} alt={getTitle()} />
			</div>
			<div className="apartment-details">
				<h3 className="apartment-title">{getTitle()}</h3>
				<p className="apartment-address">{apartment.address}</p>
				<p className="apartment-description">{apartment.description}</p>
			</div>
			<div className="apartment-price">
				{apartment.price.toLocaleString()} ₽
			</div>
		</div>
	);
};