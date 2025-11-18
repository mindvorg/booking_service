export interface Apartment {
	id: number;
	status: string;
	address: string;
	houseDate: number;
	floor: number;
	square: number;
	roomNumber: number;
	price: number;
	agentId: number;
	photo: string;
	description: string;
	district: string;
	apartType: string;
	geotag: string;
};

export interface AuthResponse {
	accessToken: string;
	refreshToken: string;
	user: IUser;
}

export interface IUser {
	email: string;
	isActivated: boolean;
	id: string;
	role: string;
}