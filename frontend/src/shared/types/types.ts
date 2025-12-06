export interface Apartment {
	id: number;
	status: number;
	address: string;
	houseDate: number;
	floor: number;
	square: number;
	roomNumber: number;
	price: number;
	agentId: number;
	photos: string[];
	description: string;
	district: string;
	apartType: string;
	geotag: string;
};

export interface AuthResponse {
	accessToken: string;
	user: IUser;
}

export interface IUser {
	email: string;
	name: string;
	id: string;
	role: 'USER' | 'AGENT' | 'ADMIN';
	companyName?: string;
	avatar?: string;
}

export type PhotoItem = {
	file: File | null;
	url: string;
	name: string;
	sizeText: string;
	isExisting?: boolean;
};

export type IRegistration = {
	email: string;
	name: string;
	role: 'USER' | 'AGENT';
	companyName?: string;
	avatar?: string;
};