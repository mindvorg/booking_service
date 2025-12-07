import { observer } from 'mobx-react-lite';
import { useContext, useState, type ChangeEvent, useEffect } from 'react';
import "./LoginForm.scss";
import { Context } from '../../app/main';
import type { IRegistration, PhotoItem } from '../../shared/types/types';
import { uploadPhotos } from '../../pages/createApartment/api';
import { redirect } from 'react-router';

type FormMode = 'LOGIN' | 'REGISTER';

const MAX_FILES = 1;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

function validatePhotos(files: File[], existingCount: number): File[] {
	const imageFiles = files.filter(f => f.type.startsWith("image/"));

	if (imageFiles.length !== files.length) {
		alert("Можно загружать только изображения (image/*)");
	}

	if (existingCount + imageFiles.length > MAX_FILES) {
		alert(`Можно загрузить не более ${MAX_FILES} фотографии.`);
		return [];
	}

	const validSizeFiles = imageFiles.filter(f => f.size <= MAX_FILE_SIZE);
	if (validSizeFiles.length !== imageFiles.length) {
		alert(`Размер файла не должен превышать ${MAX_FILE_SIZE_MB}MB.`);
	}

	return validSizeFiles;
}

function LoginForm() {
	const [formMode, setFormMode] = useState<FormMode>('LOGIN');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [fullName, setFullName] = useState('');
	const [role, setRole] = useState<'USER' | 'AGENT'>('USER');
	const [companyName, setCompanyName] = useState('');
	const [photos, setPhotos] = useState<PhotoItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [registrationStatus, setRegistrationStatus] = useState<{
		type: 'success' | 'error' | null;
		message: string;
	}>({ type: null, message: '' });

	const formatSize = (size: number) => {
		if (size < 1024) return `${size} B`;
		if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
		return `${(size / (1024 * 1024)).toFixed(2)} MB`;
	};

	const { store } = useContext(Context);

	const handleRegister = async () => {
		// Валидация обязательных полей
		if (!email || !password || !fullName) {
			setRegistrationStatus({
				type: 'error',
				message: 'Пожалуйста, заполните все обязательные поля'
			});
			return;
		}

		if (role === 'AGENT' && !companyName) {
			setRegistrationStatus({
				type: 'error',
				message: 'Для агента необходимо указать название компании'
			});
			return;
		}

		setIsLoading(true);
		setRegistrationStatus({ type: null, message: '' });

		try {
			const newPhotos = photos.filter(p => !p.isExisting && p.file);
			let finalPhotoUrls: string[] = [];

			if (newPhotos.length) {
				const uploadedUrls = await uploadPhotos(newPhotos);
				console.log(uploadedUrls);
				finalPhotoUrls = uploadedUrls;
			}

			console.log(finalPhotoUrls);

			const registrationData = {
				email,
				password,
				name: fullName,
				role,
				...(role === 'AGENT' && companyName && { companyName }),
				...(finalPhotoUrls[0] && { avatar: finalPhotoUrls[0] })
			} as IRegistration;

			const res = await store.registration(registrationData);

			if (res && res === 200) {
				// Успешная регистрация
				setRegistrationStatus({
					type: 'success',
					message: 'Регистрация прошла успешно! Теперь вы можете войти в аккаунт.'
				});

				// Очистка формы
				setEmail('');
				setPassword('');
				setFullName('');
				setCompanyName('');
				setPhotos([]);

				// Автоматическое переключение на форму входа через 2 секунды
				setTimeout(() => {
					setFormMode('LOGIN');
					setRegistrationStatus({ type: null, message: '' });
				}, 2000);

			} else if (res === 409) {
				// Пользователь уже существует
				setRegistrationStatus({
					type: 'error',
					message: 'Пользователь с таким email уже существует'
				});
			} else if (res === 400) {
				// Неверные данные
				setRegistrationStatus({
					type: 'error',
					message: 'Проверьте правильность введенных данных'
				});
			} else {
				// Общая ошибка
				setRegistrationStatus({
					type: 'error',
					message: 'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже или обратитесь в службу поддержки'
				});
			}
		} catch (error) {
			console.error('Registration error:', error);
			setRegistrationStatus({
				type: 'error',
				message: 'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже'
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogin = async () => {
		if (!email || !password) {
			setRegistrationStatus({
				type: 'error',
				message: 'Пожалуйста, введите email и пароль'
			});
			return;
		}

		setIsLoading(true);
		setRegistrationStatus({ type: null, message: '' });

		try {
			const res = await store.login(email, password);

			if (res && res === 200) {
				// Очистка формы
				setEmail('');
				setPassword('');

				redirect('/profile');

			} else {
				setRegistrationStatus({
					type: 'error',
					message: 'Неверный email или пароль'
				});
			}

		} catch (error) {
			console.error('Login error:', error);
			setRegistrationStatus({
				type: 'error',
				message: 'Неверный email или пароль'
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Очистка Object URL при размонтировании
	useEffect(() => {
		return () => {
			photos.forEach(photo => {
				if (photo.url && photo.url.startsWith('blob:')) {
					URL.revokeObjectURL(photo.url);
				}
			});
		};
	}, [photos]);

	// Сброс статуса при переключении режима
	useEffect(() => {
		setRegistrationStatus({ type: null, message: '' });
	}, [formMode]);

	// Работа с фото
	const handleAddPhotos = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files) return;

		const validated = validatePhotos(Array.from(files), photos.length);
		if (!validated.length) return;

		const arr = validated.map(file => ({
			file,
			url: URL.createObjectURL(file),
			name: file.name,
			sizeText: formatSize(file.size),
		}));

		setPhotos(prev => [...prev, ...arr]);
		e.currentTarget.value = "";
	};

	const removePhoto = (index: number) => {
		setPhotos(prev => {
			const copy = [...prev];
			URL.revokeObjectURL(copy[index].url);
			copy.splice(index, 1);
			return copy;
		});
	};

	return (
		<div className="form-container">
			<div className="mode-switcher">
				<button
					className={`mode-btn ${formMode === 'LOGIN' ? 'active' : ''}`}
					onClick={() => setFormMode('LOGIN')}
					disabled={isLoading}
				>
					Вход
				</button>
				<button
					className={`mode-btn ${formMode === 'REGISTER' ? 'active' : ''}`}
					onClick={() => setFormMode('REGISTER')}
					disabled={isLoading}
				>
					Регистрация
				</button>
			</div>

			{registrationStatus.type && (
				<div className={`status-message ${registrationStatus.type}`}>
					{registrationStatus.message}
					{registrationStatus.type === 'success' && formMode === 'REGISTER' && (
						<div className="success-hint">
							Автоматический переход на форму входа...
						</div>
					)}
				</div>
			)}

			<div className="form">
				<input
					type="text"
					placeholder='Email'
					value={email}
					onChange={e => setEmail(e.target.value)}
					className='inputForm'
					disabled={isLoading}
				/>
				<input
					type="password"
					placeholder='Пароль'
					value={password}
					onChange={e => setPassword(e.target.value)}
					className='inputForm'
					disabled={isLoading}
				/>

				{formMode === 'REGISTER' && (
					<>
						<input
							type="text"
							placeholder='ФИО *'
							value={fullName}
							onChange={e => setFullName(e.target.value)}
							className='inputForm'
							disabled={isLoading}
						/>

						<div className="role-selector">
							<label className="role-label">Роль:</label>
							<div className="role-options">
								<label className="role-option">
									<input
										type="radio"
										name="role"
										value="USER"
										checked={role === 'USER'}
										onChange={() => setRole('USER')}
										disabled={isLoading}
									/>
									<span>Пользователь</span>
								</label>
								<label className="role-option">
									<input
										type="radio"
										name="role"
										value="AGENT"
										checked={role === 'AGENT'}
										onChange={() => setRole('AGENT')}
										disabled={isLoading}
									/>
									<span>Агент</span>
								</label>
							</div>
						</div>

						{role === 'AGENT' && (
							<>
								<input
									type="text"
									placeholder='Название компании *'
									value={companyName}
									onChange={e => setCompanyName(e.target.value)}
									className='inputForm'
									disabled={isLoading}
								/>

								<div className="avatar-upload">
									<label className="avatar-label">Аватар:</label>
									<div className="field-input">
										<div className="avatar-grid">
											{photos.map((p, i) => (
												<div className="avatar-item" key={i}>
													<div className="thumb-wrap">
														<img src={p.url} alt={p.name} />
													</div>
													<div className="avatar-meta">
														<div className="avatar-name" title={p.name}>{p.name}</div>
														<div className="avatar-size">{p.sizeText}</div>
													</div>
													<button
														className="btn remove"
														onClick={() => removePhoto(i)}
														aria-label={`Удалить ${p.name}`}
														disabled={isLoading}
													>
														✕
													</button>
												</div>
											))}
										</div>
										<div className="avatar-actions">
											<label className={`btn add-avatar ${isLoading ? 'disabled' : ''}`}>
												Добавить фотографию
												<input
													type="file"
													multiple
													accept="image/*"
													onChange={handleAddPhotos}
													disabled={isLoading || photos.length >= MAX_FILES}
												/>
											</label>
										</div>
									</div>
								</div>
							</>
						)}
					</>
				)}

				{formMode === 'LOGIN' ? (
					<button
						onClick={handleLogin}
						className='btnForm primary'
						disabled={isLoading}
					>
						{isLoading ? 'Вход...' : 'Войти'}
					</button>
				) : (
					<button
						onClick={handleRegister}
						className='btnForm primary'
						disabled={isLoading}
					>
						{isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
					</button>
				)}

				<div className="form-switch">
					{formMode === 'LOGIN' ? (
						<span>
							Нет аккаунта?{' '}
							<button
								type="button"
								className="switch-link"
								onClick={() => setFormMode('REGISTER')}
								disabled={isLoading}
							>
								Зарегистрироваться
							</button>
						</span>
					) : (
						<span>
							Уже есть аккаунт?{' '}
							<button
								type="button"
								className="switch-link"
								onClick={() => setFormMode('LOGIN')}
								disabled={isLoading}
							>
								Войти
							</button>
						</span>
					)}
				</div>
			</div>
		</div>
	);
}

export default observer(LoginForm);