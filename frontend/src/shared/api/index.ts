import type { Apartment, IApartFeedback, IUser } from '../types/types';

export async function getApartmentById(id: number): Promise<Apartment> {

	const res = await fetch("http://localhost:8080/apartments/" + id);

	if (!res.ok) throw new Error("Не удалось загрузить объявление");

	const data = await res.json();
	return data as Apartment;
}

export async function deleteApartmentById(id: number): Promise<void> {

	const res = await fetch("http://localhost:8080/apartments/" + id, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
			'Content-Type': 'application/json'
		},
	});

	if (!res.ok) throw new Error("Не удалось загрузить объявление");

}

export async function getAgentById(id: number): Promise<IUser> {

	const res = await fetch("http://localhost:8080/users/agents/" + id);

	if (!res.ok) throw new Error("Не удалось загрузить агента");

	const data = await res.json();
	return data as IUser;
}

export async function getUserList(): Promise<IUser[]> {
	const res = await fetch('http://localhost:8080/users/all', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
			'Content-Type': 'application/json'
		}
	});

	if (!res.ok) throw new Error("Не удалось загрузить агента");

	const data = await res.json();
	return data as IUser[];
}

export async function changeUserRole(userId: number, newRole: string): Promise<IUser[]> {
	const res = await fetch('http://localhost:8080/users/admin/changeRole', {
		method: 'PATCH',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			id: userId,
			role: newRole,
		})
	});

	if (!res.ok) throw new Error("Не удалось загрузить агента");

	const data = await res.json();
	return data as IUser[];
}

export async function getFeedbackApartmentById(id: number): Promise<IApartFeedback[]> {

	const res = await fetch("http://localhost:8080/apartments/feedback/" + id);

	if (!res.ok) throw new Error("Не удалось загрузить объявление");

	const data = await res.json();
	return data as IApartFeedback[];
}