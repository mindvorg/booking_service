import { observer } from 'mobx-react-lite';
import { useContext, useState, type ChangeEvent } from 'react';
import "./LoginForm.scss";
import { Context } from '../../app/main';
import type { IRegistration, PhotoItem } from '../../shared/types/types';
import { uploadPhotos } from '../../pages/createApartment/api';

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

	const formatSize = (size: number) => {
		if (size < 1024) return `${size} B`;
		if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
		return `${(size / (1024 * 1024)).toFixed(2)} MB`;
	};


	const { store } = useContext(Context);

	const handleRegister = async () => {

		const newPhotos = photos.filter(p => !p.isExisting && p.file);
		let finalPhotoUrls: string[] = [];
		if (newPhotos.length) {
			const uploadedUrls = await uploadPhotos(newPhotos); // массив URL
			finalPhotoUrls = [...photos.map(p => p.url), ...uploadedUrls];
		} else {
			finalPhotoUrls = photos.map(p => p.url);
		}

		const registrationData = {
			email,
			password,
			name: fullName,
			role,
			...(role === 'AGENT' && companyName && { companyName }),
			...(finalPhotoUrls[0] && { avatar: finalPhotoUrls[0] })
		} as IRegistration;

		store.registration(registrationData);
	};

	const handleLogin = () => {
		store.login(email, password);
	};

	// --- Работа с фото ---
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
				>
					Вход
				</button>
				<button
					className={`mode-btn ${formMode === 'REGISTER' ? 'active' : ''}`}
					onClick={() => setFormMode('REGISTER')}
				>
					Регистрация
				</button>
			</div>

			<div className="form">
				<input
					type="text"
					placeholder='Email'
					value={email}
					onChange={e => setEmail(e.target.value)}
					className='inputForm'
				/>
				<input
					type="password"
					placeholder='Пароль'
					value={password}
					onChange={e => setPassword(e.target.value)}
					className='inputForm'
				/>

				{formMode === 'REGISTER' && (
					<>
						<input
							type="text"
							placeholder='ФИО'
							value={fullName}
							onChange={e => setFullName(e.target.value)}
							className='inputForm'
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
									/>
									<span>Агент</span>
								</label>
							</div>
						</div>

						{role === 'AGENT' && (
							<>
								<input
									type="text"
									placeholder='Название компании'
									value={companyName}
									onChange={e => setCompanyName(e.target.value)}
									className='inputForm'
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
													<button className="btn remove" onClick={() => removePhoto(i)} aria-label={`Удалить ${p.name}`}>✕</button>
												</div>
											))}
										</div>
										<div className="avatar-actions">
											<label className="btn add-avatar">
												Добавить фотографию
												<input type="file" multiple accept="image/*" onChange={handleAddPhotos} />
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
					>
						Войти
					</button>
				) : (
					<button
						onClick={handleRegister}
						className='btnForm primary'
					>
						Зарегистрироваться
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