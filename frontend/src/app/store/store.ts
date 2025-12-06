import { makeAutoObservable } from 'mobx';
import AuthService from '../../shared/services/AuthService';
import type { IRegistration, IUser } from '../../shared/types/types';


export default class Store {
	user = {} as IUser;
	isAuth = false;
	isLoading = false;
	constructor() {
		makeAutoObservable(this);
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

	async login(email: string, password: string) {
		try {
			const response = await AuthService.login(email, password);
			console.log(response);
			localStorage.setItem('token', response.data.accessToken);
			this.setAuth(true);
			this.setUser(response.data.user);
		} catch (e: any) {
			console.error(e.response?.data?.message);
		}
	}

	async registration(params: IRegistration) {
		try {
			const response = await AuthService.registration(params);
			console.log(response);
			localStorage.setItem('token', response.data.accessToken);
			this.setAuth(true);
			this.setUser(response.data.user);
		} catch (e: any) {
			console.error(e.response?.data?.message);
		}
	}

	async logout() {
		try {
			await AuthService.logout();
			localStorage.removeItem('token');
			this.setAuth(false);
			this.setUser({} as IUser);
		} catch (e: any) {
			console.error(e.response?.data?.message);
		}
	}
}