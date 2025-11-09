// ApartmentCardSkeleton.tsx
import "../ApartmentCard.scss";

export const ApartmentCardSkeleton = () => {
	return (
		<div className="apartment-card apartment-card--skeleton">
			<div className="apartment-image skeleton"></div>
			<div className="apartment-details">
				<div className="apartment-title skeleton skeleton-text"></div>
				<div className="apartment-area skeleton skeleton-text"></div>
				<div className="apartment-price skeleton skeleton-text"></div>
			</div>
		</div>
	);
};