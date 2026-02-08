import './Agents.scss';
import { useState, useEffect } from "react";
import { AgentsList } from "../../widget";
import type { IAgent } from '../../shared/types/types';

export const Agents = () => {
	const [agents, setAgents] = useState<IAgent[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	// Функция для загрузки данных по текущему URL
	const fetchAgents = async () => {
		setLoading(true);
		try {
			const response = await fetch('http://localhost:8080/users/agents/all');

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setAgents(data);
		} catch (error) {
			console.error("Ошибка загрузки данных:", error);
			setAgents([]);
		} finally {
			setLoading(false);
		}
	};

	// При монтировании загружаем данные
	useEffect(() => {
		fetchAgents();
	}, []);

	return (
		<div className="main">
			{agents.length === 0 && !loading ? (
				<div className="no-results">
					<h3>Ничего не найдено</h3>
				</div>
			) : (
				<AgentsList agents={agents} loading={loading} />
			)}
		</div>
	);
};