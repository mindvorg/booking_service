// ApartmentCardSkeleton.tsx
import "../ApartmentCard.scss";

export const ApartmentCardSkeleton = () => {
	return (
		<div className="apartment-card apartment-card--skeleton">
			<div className="apartment-image skeleton"></div>
			<div className="apartment-details">
				<div className="apartment-title skeleton skeleton-text"></div>
				<div className="apartment-address skeleton skeleton-text"></div>
				<div className="apartment-description">
					<div className="skeleton skeleton-text"></div>
					<div className="skeleton skeleton-text"></div>
					<div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
				</div>
			</div>
			<div className="apartment-price skeleton"></div>
		</div>
	);
};