import type { Apartment, IAgentFeedback, IApartFeedback, IUser } from '../types/types';

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

	if (!res.ok) throw new Error("Не удалось загрузить отзывы на квартиру");

	const data = await res.json();
	return data as IApartFeedback[];
}

export async function getFeedbackAgentById(id: number): Promise<IAgentFeedback[]> {

	const res = await fetch("http://localhost:8080/users/agents/feedback/" + id);

	if (!res.ok) throw new Error("Не удалось загрузить отзывы на агента");

	const data = await res.json();
	return data as IAgentFeedback[];
}

export async function createFeedbackApartment(params: IApartFeedback): Promise<IApartFeedback> {

	const { id, ...payload } = params;

	const res = await fetch("http://localhost:8080/apartments/feedback/add", {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (!res.ok) throw new Error("Не удалось загрузить объявление");

	const data = await res.json();
	return data as IApartFeedback;
}

export async function createFeedbackAgent(params: IAgentFeedback): Promise<IAgentFeedback> {

	const { id, ...payload } = params;

	const res = await fetch("http://localhost:8080/users/agents/feedback/add", {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${localStorage.getItem('token')}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (!res.ok) throw new Error("Не удалось загрузить объявление");

	const data = await res.json();
	return data as IAgentFeedback;
}