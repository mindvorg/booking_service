import { useContext, useState, useEffect } from 'react';
import { observer } from "mobx-react-lite";
import "./Auth.scss";
import { Context } from '../../app/main';
import LoginForm from '../../features/loginForm/LoginForm';
import type { IUser } from '../../shared/types/types';

function Auth() {
	const { store } = useContext(Context);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: '',
		companyName: '',
	});
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string>('');
	const [isSaving, setIsSaving] = useState(false);

	// Инициализируем форму данными пользователя
	useEffect(() => {
		if (store.user) {
			setFormData({
				name: store.user.name || '',
				companyName: store.user.companyName || '',
			});
			if (store.user.avatar) {
				setAvatarPreview(store.user.avatar);
			}
		}
	}, [store.user]);

	if (!store.isAuth) {
		return <LoginForm />;
	}

	// Функция перевода роли на русский
	const getRoleInRussian = (role: string) => {
		switch (role) {
			case 'USER': return 'Пользователь';
			case 'AGENT': return 'Агент недвижимости';
			case 'ADMIN': return 'Администратор';
			default: return role;
		}
	};

	// Обработчик выбора аватара
	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setAvatarFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setAvatarPreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	// Удаление аватара
	const handleRemoveAvatar = () => {
		setAvatarFile(null);
		setAvatarPreview('');
	};

	// Обработчик сохранения изменений
	const handleSave = async () => {
		if (!store.user?.id) return;

		const updates: Record<string, any> = {};

		// Для пользователя только имя
		if (store.user.role === 'USER') {
			if (formData.name !== store.user.name) {
				updates.name = formData.name;
			}
		}

		// Для агента имя и компания
		if (store.user.role === 'AGENT') {
			if (formData.name !== store.user.name) updates.name = formData.name;
			if (formData.companyName !== store.user.companyName) updates.companyName = formData.companyName;
		}

		// Если нет изменений в текстовых полях и нет нового аватара
		if (Object.keys(updates).length === 0 && !avatarFile) {
			setIsEditing(false);
			return;
		}

		setIsSaving(true);
		try {
			// Сначала загружаем аватар, если есть
			if (avatarFile && store.user.role === 'AGENT') {
				const avatarUrl = await uploadAvatar(avatarFile, store.user.id);
				updates.avatar = avatarUrl;
			}

			// Если есть изменения текстовых полей, отправляем их
			if (Object.keys(updates).length > 0) {
				await store.edit(updates, store.user.id);
			}

			setIsEditing(false);
		} catch (error) {
			console.error('Ошибка при сохранении:', error);
		} finally {
			setIsSaving(false);
		}
	};

	// Функция загрузки аватара (нужно будет реализовать в api)
	const uploadAvatar = async (file: File, userId: number): Promise<string> => {
		// Временная заглушка - реализуйте загрузку на сервер
		return URL.createObjectURL(file);
	};

	// Обработчик отмены редактирования
	const handleCancel = () => {
		if (store.user) {
			setFormData({
				name: store.user.name || '',
				companyName: store.user.companyName || '',
			});
			setAvatarPreview(store.user.avatar || '');
			setAvatarFile(null);
		}
		setIsEditing(false);
	};

	const user = store.user as IUser;

	return (
		<div className="profile-page">
			{/* Хедер страницы */}
			<header className="profile-header">
				<div className="container">
					<h1>Личный кабинет</h1>
					<div className="user-role">{getRoleInRussian(user.role)}</div>
				</div>
			</header>

			<div className="container">
				<div className="profile-layout">
					{/* Основной контент */}
					<main className="profile-content">
						<div className="content-header">
							{!isEditing && (
								<button
									onClick={() => setIsEditing(true)}
									className="edit-profile-btn"
									style={{ backgroundColor: '#20ab5f' }}
									onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#188b4b'}
									onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#20ab5f'}
								>
									Редактировать профиль
								</button>
							)}
						</div>

						<div className="profile-info-section">
							{/* Блок с аватаром (только для агентов) */}
							{user.role === 'AGENT' && (
								<div className="avatar-block">
									<h3>Фотография профиля</h3>
									<div className="avatar-container">
										<div className="avatar-preview">
											{avatarPreview ? (
												<img src={avatarPreview} alt="Аватар" className="avatar-image" />
											) : (
												<div className="avatar-placeholder">
													<span className="avatar-icon">👨‍💼</span>
												</div>
											)}
										</div>
										{isEditing ? (
											<div className="avatar-controls">
												<label className="avatar-upload-btn">
													<input
														type="file"
														accept="image/*"
														onChange={handleAvatarChange}
														style={{ display: 'none' }}
													/>
													<span>Выбрать фото</span>
												</label>
												{avatarPreview && (
													<button
														onClick={handleRemoveAvatar}
														className="avatar-remove-btn"
													>
														Удалить
													</button>
												)}
												<p className="avatar-hint">
													Рекомендуемый размер: 500×500 px
												</p>
											</div>
										) : (
											<p className="avatar-note">
												{user.avatar
													? 'Фотография профиля установлена'
													: 'Фотография профиля не установлена'}
											</p>
										)}
									</div>
								</div>
							)}

							{/* Основная информация */}
							<div className="info-block">
								<h3>Основная информация</h3>
								{isEditing ? (
									<div className="edit-form">
										<div className="form-group">
											<label htmlFor="name">Ваше имя</label>
											<input
												id="name"
												type="text"
												value={formData.name}
												onChange={(e) => setFormData({ ...formData, name: e.target.value })}
												placeholder="Введите ваше имя"
												className="form-input"
											/>
										</div>

										<div className="form-group">
											<label htmlFor="email">Email адрес</label>
											<input
												id="email"
												type="email"
												value={user.email}
												disabled
												className="form-input disabled"
											/>
											<p className="field-note">Email нельзя изменить</p>
										</div>

										{user.role === 'AGENT' && (
											<div className="form-group">
												<label htmlFor="companyName">Название компании</label>
												<input
													id="companyName"
													type="text"
													value={formData.companyName}
													onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
													placeholder="Введите название компании"
													className="form-input"
												/>
											</div>
										)}

										<div className="form-group">
											<label>Роль в системе</label>
											<input
												value={getRoleInRussian(user.role)}
												disabled
												className="form-input disabled"
											/>
											<p className="field-note">Роль нельзя изменить</p>
										</div>
									</div>
								) : (
									<div className="info-grid">
										<div className="info-item">
											<span className="info-label">Имя</span>
											<span className="info-value">{user.name}</span>
										</div>
										<div className="info-item">
											<span className="info-label">Email</span>
											<span className="info-value">{user.email}</span>
										</div>
										{user.role === 'AGENT' && user.companyName && (
											<div className="info-item">
												<span className="info-label">Компания</span>
												<span className="info-value">{user.companyName}</span>
											</div>
										)}
										<div className="info-item">
											<span className="info-label">Роль</span>
											<span className="info-value">{getRoleInRussian(user.role)}</span>
										</div>
									</div>
								)}
							</div>

							{/* Для агентов - кнопка Мои объявления */}
							{user.role === 'AGENT' && !isEditing && (
								<div className="agent-actions">
									<button
										className="my-listings-btn"
										style={{ backgroundColor: '#20ab5f' }}
										onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#188b4b'}
										onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#20ab5f'}
										onClick={() => {
											// Навигация к моим объявлениям
											window.location.href = '/my-listings';
										}}
									>
										<span className="btn-icon">🏠</span>
										Мои объявления
									</button>
								</div>
							)}

							{/* Кнопки действий в режиме редактирования */}
							{isEditing && (
								<div className="edit-actions">
									<button
										onClick={handleSave}
										disabled={isSaving}
										className="save-btn"
										style={{ backgroundColor: '#20ab5f' }}
										onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#188b4b'}
										onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#20ab5f'}
									>
										{isSaving ? 'Сохранение...' : 'Сохранить изменения'}
									</button>
									<button
										onClick={handleCancel}
										disabled={isSaving}
										className="cancel-btn"
									>
										Отменить
									</button>
								</div>
							)}
						</div>
					</main>
				</div>
			</div>
		</div>
	);
}

export default observer(Auth);