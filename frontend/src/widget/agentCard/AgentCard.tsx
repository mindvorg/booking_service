// AgentCard.tsx
import type { IAgent } from '../../shared/types/types';
import "./AgentCard.scss";

interface AgentCardProps {
	agent: IAgent;
}

export const AgentCard = ({ agent }: AgentCardProps) => {

	const getAvatar = (): string | undefined => {
		return agent.avatar ? agent.avatar : undefined;
	};

	return (
		<div className="agent-card">
			<div className="agent-image">
				<img src={getAvatar()} alt={agent.name} />
			</div>
			<div className="agent-details">
				<h3 className="agent-name">{agent.name}</h3>
				<p className="agent-companyName">{agent.companyName}</p>
				<p className="agent-email">{agent.email}</p>
			</div>
		</div>
	);
};