import { useState, useEffect } from 'react';
import './adminPanel.scss';
import type { IUser } from '../../shared/types/types';
import { changeUserRole, getUserList } from '../../shared/api';

const ROLE_LABELS = {
	USER: 'Пользователь',
	AGENT: 'Агент',
	ADMIN: 'Администратор',
} as const;

function AdminPanel() {
	const [users, setUsers] = useState<IUser[]>([]);
	const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
	const [showRoleModal, setShowRoleModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [newRole, setNewRole] = useState<'USER' | 'AGENT' | 'ADMIN'>('USER');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; } | null>(null);

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await getUserList();
				if (res) {
					setUsers(res);
				}
			} catch (error) {
				console.error('Error fetching users:', error);
				setMessage({ type: 'error', text: 'Ошибка при загрузке пользователей' });
			}
		};

		fetchUsers();
	}, []);

	const changeRole = async (userId: number, newRole: 'USER' | 'AGENT' | 'ADMIN') => {
		setLoading(true);
		try {
			// Запрос на сервер для изменения роли
			await changeUserRole(userId, newRole);

			setMessage({ type: 'success', text: 'Роль пользователя успешно изменена' });

			// Скрываем сообщение через 3 секунды
			setTimeout(() => setMessage(null), 3000);

			return true;
		} catch (error) {
			console.error('Error changing role:', error);
			setMessage({ type: 'error', text: 'Ошибка при изменении роли' });
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Обработчик нажатия на кнопку смены роли
	const handleRoleChangeClick = (user: IUser) => {
		setSelectedUser(user);
		setNewRole(user.role);
		setShowRoleModal(true);
	};

	// Обработчик выбора новой роли
	const handleRoleSelect = (role: 'USER' | 'AGENT' | 'ADMIN') => {
		setNewRole(role);

		// Если меняем роль на/с ADМИНА - показываем дополнительное подтверждение
		if (selectedUser && (selectedUser.role === 'ADMIN' || role === 'ADMIN')) {
			setShowConfirmModal(true);
		}
		// Для USER и AGENT ничего не делаем - ждем нажатия "Подтвердить"
	};

	// Обработчик подтверждения в первом модальном окне
	const handleFirstModalConfirm = () => {
		if (!selectedUser) return;

		// Если меняем роль на/с ADМИНА - показываем дополнительное подтверждение
		if (selectedUser.role === 'ADMIN' || newRole === 'ADMIN') {
			setShowConfirmModal(true);
		} else {
			// Для USER/AGENT сразу подтверждаем изменение
			confirmRoleChange();
		}
	};

	// Подтверждение смены роли (после всех проверок)
	const confirmRoleChange = async () => {
		if (!selectedUser) return;

		const success = await changeRole(selectedUser.id, newRole);
		if (success) {
			setShowRoleModal(false);
			setShowConfirmModal(false);
			setSelectedUser(null);
		}
	};

	// Отмена в ПЕРВОМ модальном окне (выбор роли)
	const cancelFirstModal = () => {
		setShowRoleModal(false);
		setSelectedUser(null);
	};

	// Отмена во ВТОРОМ модальном окне (подтверждение для админов)
	const cancelSecondModal = () => {
		setShowConfirmModal(false);
		// Первый модал остается открытым
	};

	// Получение доступных ролей для смены
	const getAvailableRoles = (currentRole: 'USER' | 'AGENT' | 'ADMIN') => {
		const allRoles: ('USER' | 'AGENT' | 'ADMIN')[] = ['USER', 'AGENT', 'ADMIN'];
		return allRoles.filter(role => role !== currentRole);
	};

	// Получение класса для роли
	const getRoleClass = (role: 'USER' | 'AGENT' | 'ADMIN') => {
		switch (role) {
			case 'USER': return 'role-user';
			case 'AGENT': return 'role-agent';
			case 'ADMIN': return 'role-admin';
			default: return '';
		}
	};

	return (
		<div className='container_panel'>
			<h1 className='panel-title'>Админ панель</h1>

			{message && (
				<div className={`message ${message.type}`}>
					{message.text}
				</div>
			)}

			{/* Список пользователей */}
			<div className='users-list'>
				{users.length === 0 ? (
					<div key="no-users" className='no-users'>
						Пользователи не найдены
					</div>
				) : (
					users.map((user, index) => (
						<div key={index + user.name} className='user-card'>
							<div className='user-info'>
								<div className='user-main'>
									<div className='user-name'>{user.name}</div>
									<div className='user-email'>{user.email}</div>
									{user.companyName && (
										<div className='user-company'>Компания: {user.companyName}</div>
									)}
									{user.agentId && (
										<div className='user-agent-id'>ID агента: {user.agentId}</div>
									)}
								</div>
								<div className='user-role'>
									<span className={`role-badge ${getRoleClass(user.role)}`}>
										{ROLE_LABELS[user.role]}
									</span>
								</div>
							</div>
							<div className='user-actions'>
								<button
									className='change-role-btn'
									onClick={() => handleRoleChangeClick(user)}
									disabled={loading}
								>
									Сменить роль
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{/* ПЕРВОЕ модальное окно выбора роли */}
			{showRoleModal && selectedUser && (
				<div className='modal-overlay' onClick={cancelFirstModal}>
					<div className='modal-content' onClick={(e) => e.stopPropagation()}>
						<h2>Смена роли пользователя</h2>
						<div className='modal-user-info'>
							<div className='modal-user-name'>{selectedUser.name}</div>
							<div className='modal-user-email'>{selectedUser.email}</div>
							<div className='current-role'>
								Текущая роль: <span className={`role-badge ${getRoleClass(selectedUser.role)}`}>
									{ROLE_LABELS[selectedUser.role]}
								</span>
							</div>
						</div>

						<div className='role-selection'>
							<p>Выберите новую роль:</p>
							<div className='role-options'>
								{getAvailableRoles(selectedUser.role).map(role => (
									<button
										key={role}
										className={`role-option ${newRole === role ? 'selected' : ''} ${getRoleClass(role)}`}
										onClick={() => handleRoleSelect(role)}
									>
										{ROLE_LABELS[role]}
									</button>
								))}
							</div>
						</div>

						<div className='modal-actions'>
							<button className='btn-cancel' onClick={cancelFirstModal}>
								Отмена
							</button>
							<button
								className='btn-confirm'
								onClick={handleFirstModalConfirm}
								disabled={newRole === selectedUser.role}
							>
								Подтвердить
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ВТОРОЕ модальное окно подтверждения для админов */}
			{showConfirmModal && selectedUser && (
				<div className='modal-overlay' onClick={cancelSecondModal}>
					<div className='modal-content confirm-modal' onClick={(e) => e.stopPropagation()}>
						<h2>Подтверждение смены роли</h2>

						<div className='warning-message'>
							<div className='warning-icon'>⚠️</div>
							<div className='warning-text'>
								{selectedUser.role === 'ADMIN' && newRole !== 'ADMIN' ? (
									<p>
										Вы собираетесь <strong>понизить роль администратора</strong>.
										Пользователь <strong>{selectedUser.name}</strong> потеряет права администратора.
									</p>
								) : newRole === 'ADMIN' ? (
									<p>
										Вы собираетесь <strong>повысить роль пользователя до администратора</strong>.
										Пользователь <strong>{selectedUser.name}</strong> получит полные права администратора.
									</p>
								) : null}
								<p>Вы уверены, что хотите продолжить?</p>
							</div>
						</div>

						<div className='role-change-details'>
							<div className='role-change-from'>
								<span className='label'>Текущая роль:</span>
								<span className={`role-badge ${getRoleClass(selectedUser.role)}`}>
									{ROLE_LABELS[selectedUser.role]}
								</span>
							</div>
							<div className='role-change-arrow'>→</div>
							<div className='role-change-to'>
								<span className='label'>Новая роль:</span>
								<span className={`role-badge ${getRoleClass(newRole)}`}>
									{ROLE_LABELS[newRole]}
								</span>
							</div>
						</div>

						<div className='modal-actions'>
							<button className='btn-cancel' onClick={cancelSecondModal}>
								Отмена
							</button>
							<button
								className='btn-confirm warning'
								onClick={confirmRoleChange}
								disabled={loading}
							>
								{loading ? 'Изменение...' : 'Да, изменить роль'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default AdminPanel;