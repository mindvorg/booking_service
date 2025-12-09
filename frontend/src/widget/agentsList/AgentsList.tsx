
import { NavLink } from 'react-router-dom';
import "./AgentsList.scss";
import type { IAgent } from '../../shared/types/types';
import { AgentCard, AgentCardSkeleton } from '..';

interface AgentsListProps {
	agents: IAgent[];
	loading: boolean;
}

export const AgentsList = ({ agents, loading }: AgentsListProps) => {

	return (
		<div className="agents-list">
			<div className='agents-list-title'>Агенты</div>
			{loading ? (
				// Скелетоны во время загрузки
				Array.from({ length: 10 }).map((_, index) => (
					<AgentCardSkeleton key={`skeleton-${index}`} />
				))
			) : (
				// Карточки агентов
				agents.map(agent => (
					<NavLink to={`/agents/${agent.agentId}`} key={agent.agentId}>
						<AgentCard key={agent.agentId} agent={agent} />
					</NavLink>
				))
			)}
		</div>
	);
};
