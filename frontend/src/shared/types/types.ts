export interface Apartment {
	id?: number;
	status: number;
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
};

export interface LoginResponse {
	token: string;
	email: string;
	name: string;
	userId: number;
	role: 'USER' | 'AGENT' | 'ADMIN';
	companyName?: string;
	avatar?: string;
	agentId?: number;
}

export interface IUser {
	email: string;
	name: string;
	id: number;
	role: 'USER' | 'AGENT' | 'ADMIN';
	companyName?: string;
	avatar?: string;
	agentId?: number;
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

export type IApartFeedback = {
	userId: number;
	apartId: number;
	id: number;
	feedbackPhoto?: string;
	feedbackText: string;
};