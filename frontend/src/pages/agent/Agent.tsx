import { useParams, Navigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import './Agent.scss';
import { Context } from '../../app/main';
import type { IAgentFeedback, IAgent } from '../../shared/types/types';
import { createFeedbackAgent, getAgentById, getFeedbackAgentById } from '../../shared/api';

// Пропсы для модального окна отзыва
type FeedbackModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (feedbackData: { text: string; }) => Promise<void>;
};

// Компонент модального окна для добавления отзыва
const FeedbackModal = ({ isOpen, onClose, onSubmit }: FeedbackModalProps) => {
	const [text, setText] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async () => {
		if (!text.trim()) {
			setError('Введите текст отзыва');
			return;
		}

		setLoading(true);
		setError('');

		try {
			await onSubmit({
				text: text.trim()
			});

			// Очищаем форму после успешной отправки
			setText('');
			onClose();
		} catch (err) {
			setError('Ошибка при отправке отзыва');
			console.error('Error submitting feedback:', err);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		setText('');
		setError('');
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={handleCancel}>
			<div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
				<h2>Добавить отзыв об агенте</h2>

				{error && (
					<div className="error-message">
						{error}
					</div>
				)}

				<div className="form-row">
					<label className="field-label required">
						Текст отзыва
					</label>
					<textarea
						className="field-input textarea"
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="Напишите ваш отзыв об агенте..."
						rows={5}
						disabled={loading}
					/>
				</div>

				<div className="modal-actions">
					<button
						className="btn btn-cancel"
						onClick={handleCancel}
						disabled={loading}
					>
						Отмена
					</button>
					<button
						className="btn btn-submit"
						onClick={handleSubmit}
						disabled={!text.trim() || loading}
					>
						{loading ? 'Отправка...' : 'Добавить отзыв'}
					</button>
				</div>
			</div>
		</div>
	);
};

export const Agent = () => {
	const { id } = useParams<{ id: string; }>();
	const { store } = useContext(Context);
	const [agent, setAgent] = useState<IAgent | null>(null);
	const [feedback, setFeedback] = useState<IAgentFeedback[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showAddFeedback, setShowAddFeedback] = useState(false);
	const [feedbackLoading, setFeedbackLoading] = useState(false);

	useEffect(() => {
		// Загрузка данных агента
		const fetchAgent = async () => {
			if (!id) {
				setError('ID агента не указан');
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);

				// Загружаем агента по ID из API
				const agentData = await getAgentById(parseInt(id));

				setAgent({
					agentId: agentData.agentId ? agentData.agentId : 0,
					avatar: agentData.avatar ? agentData.avatar : '',
					companyName: agentData.companyName ? agentData.companyName : '',
					email: agentData.email,
					name: agentData.name,
					role: "AGENT",
					userId: agentData.id,
				});

				if (agentData?.agentId) {
					// Загружаем отзывы на агента
					const feedbackData = await getFeedbackAgentById(agentData.agentId);
					setFeedback(feedbackData);
				}
			} catch (error) {
				console.error('Ошибка загрузки агента:', error);
				setError('Не удалось загрузить информацию об агенте');
				setAgent(null);
			} finally {
				setLoading(false);
			}
		};

		fetchAgent();
	}, [id]);

	// Функция для отправки отзыва
	const handleSubmitFeedback = async (feedbackData: { text: string; }) => {
		setFeedbackLoading(true);
		try {
			const params: IAgentFeedback = {
				agentId: agent?.agentId as number,
				id: 0,
				userId: store.user.id,
				text: feedbackData.text
			};

			// Создаем отзыв
			const newFeedback = await createFeedbackAgent(params);

			// Добавляем новый отзыв в список
			setFeedback(prev => [...prev, newFeedback]);

			return Promise.resolve();
		} catch (error) {
			console.error('Error creating feedback:', error);
			throw error;
		} finally {
			setFeedbackLoading(false);
		}
	};

	if (loading) {
		return <div className="agent-loading">Загрузка...</div>;
	}

	if (error) {
		return (
			<div className="agent-error">
				<p>{error}</p>
				<Navigate to="/" replace />
			</div>
		);
	}

	if (!agent) {
		return <Navigate to="/" replace />;
	}

	return (
		<div className="agent-page">
			<div className="agent-container">
				{/* Основная информация */}
				<div className="agent-header">
					<div className="agent-avatar-section">
						{agent.avatar ? (
							<img
								src={agent.avatar}
								alt={agent.name}
								className="agent-avatar-main"
							/>
						) : (
							<div className="agent-avatar-placeholder">
								{agent.name.charAt(0).toUpperCase()}
							</div>
						)}
					</div>
					<div className="agent-info-section">
						<h1 className="agent-name">{agent.name}</h1>
						{agent.companyName && (
							<div className="agent-company">{agent.companyName}</div>
						)}
						<div className="agent-email">
							<span className="info-label">Email:</span>
							<span className="info-value">{agent.email}</span>
						</div>
					</div>
				</div>

				{/* Отзывы */}
				<div className="agent-feedback-section">
					<div className="section-header">
						<h2>Отзывы об агенте</h2>
						{
							store.isAuth ? <button
								className="btn add-feedback-btn"
								onClick={() => setShowAddFeedback(true)}
								disabled={feedbackLoading}
							>
								+ Добавить отзыв
							</button> : null
						}
					</div>

					{feedback.length === 0 ? (
						<p className="no-feedback-text">На агента нет отзывов</p>
					) : (
						<div className="feedback-list">
							{feedback.map((item) => (
								<div key={item.id} className="feedback-item">
									<div className="feedback-text">
										{item.text}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Модальное окно добавления отзыва */}
				<FeedbackModal
					isOpen={showAddFeedback}
					onClose={() => setShowAddFeedback(false)}
					onSubmit={handleSubmitFeedback}
				/>
			</div>
		</div>
	);
};