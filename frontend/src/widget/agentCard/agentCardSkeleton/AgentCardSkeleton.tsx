// ApartmentCardSkeleton.tsx
import "../../apartmentCard/ApartmentCard.scss";

export const AgentCardSkeleton = () => {
	return (
		<div className="apartment-card apartment-card--skeleton" style={{ height: '200px' }}>
			<div className="apartment-image skeleton"></div>
			<div className="apartment-details">
				<div className="apartment-title skeleton skeleton-text"></div>
				<div className="apartment-address skeleton skeleton-text"></div>
				<div className="apartment-description">
					<div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
				</div>
			</div>
		</div>
	);
};