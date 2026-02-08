import { makeAutoObservable } from 'mobx';
import type { IRegistration, IUser, LoginResponse } from '../../shared/types/types';


export default class Store {
	user = {} as IUser;
	isAuth = false;
	isLoading = false;
	constructor() {
		makeAutoObservable(this);
		this.loadFromStorage();
	}

	setAuth(bool: boolean) {
		this.isAuth = bool;
	}

	setUser(user: IUser) {
		this.user = user;
	}

	setLoading(bool: boolean) {
		this.isLoading = bool;
	}

	loadFromStorage() {
		const token = localStorage.getItem('token');
		const userStr = localStorage.getItem('user');

		if (token && userStr) {
			try {
				this.user = JSON.parse(userStr);
				this.isAuth = true;
			} catch (error) {
				console.error('Failed to parse user from storage:', error);
				this.clearStorage();
			}
		}
	}

	clearStorage() {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		this.user = {} as IUser;
		this.isAuth = false;
	}

	async login(email: string, password: string) {
		let response;
		try {
			response = await fetch('http://localhost:8080/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password })
			});
			const { token, ...other } = await response.json() as LoginResponse;

			localStorage.setItem('token', token);
			localStorage.setItem('user', JSON.stringify(other));
			this.setAuth(true);
			this.setUser(other);
		} catch (e: any) {
			console.error(e.response?.data?.message);
		} finally {
			return response?.status;
		}
	}

	async registration(registrationData: IRegistration): Promise<number | undefined> {
		let response;
		try {
			response = await fetch('http://localhost:8080/users/registration', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(registrationData)
			});
		} catch (e: any) {
			console.error(e.response?.data?.message);
		} finally {
			return response?.status;
		}
	}

	async logout() {
		try {
			await fetch('http://localhost:8080/auth/logout', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`,
				},
			});
			this.clearStorage();
		} catch (e: any) {
			console.error(e.response?.data?.message);
		}
	}

	async edit(updates: Record<string, any>, id: number) {
		console.log(updates);
		try {
			const response = await fetch(`http://localhost:8080/users/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`,
				},
				body: JSON.stringify(updates)
			});

			const token = await response.text();

			this.user = { ...this.user, ...updates };
			localStorage.setItem('token', token);
			localStorage.setItem('user', JSON.stringify(this.user));
		} catch (e: any) {
			console.error(e.response?.data?.message);
		}
	}
}