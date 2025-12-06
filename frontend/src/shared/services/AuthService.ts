import type { AxiosResponse } from 'axios';
import api from '../../app/http';
import type { AuthResponse, IRegistration } from '../types/types';


export default class AuthService {
	static async login(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
		return api.post<AuthResponse>('/login', { email, password });
	}

	static async registration(params: IRegistration): Promise<AxiosResponse<AuthResponse>> {
		return api.post<AuthResponse>('/registration', { params });
	}

	static async logout(): Promise<void> {
		return api.post('/logout');
	}
}