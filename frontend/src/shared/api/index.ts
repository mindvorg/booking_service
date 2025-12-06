import type { Apartment } from '../types/types';

export async function getApartmentById(id: number): Promise<Apartment> {

	const res = await fetch("/api/apartments/" + id);

	if (!res.ok) throw new Error("Не удалось загрузить объявление");

	const data = await res.json();
	return data as Apartment;
} 