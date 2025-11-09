// ApartmentCard.tsx
import "./ApartmentCard.scss";

interface ApartmentCardProps {
	apartment: {
		id: number;
		title: string;
		price: number;
		area: number;
		image: string;
	};
}

export const ApartmentCard = ({ apartment }: ApartmentCardProps) => {
	return (
		<div className="apartment-card">
			<div className="apartment-image">
				<img src={apartment.image} alt={apartment.title} />
			</div>
			<div className="apartment-details">
				<h3 className="apartment-title">{apartment.title}</h3>
				<p className="apartment-area">Площадь: {apartment.area} м²</p>
				<p className="apartment-price">Цена: {apartment.price.toLocaleString()} ₽</p>
			</div>
		</div>
	);
};