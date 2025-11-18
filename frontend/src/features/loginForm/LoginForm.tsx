import { observer } from 'mobx-react-lite';
import { useContext, useState } from 'react';
import "./LoginForm.scss";
import { Context } from '../../app/main';

function LoginForm() {

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const { store } = useContext(Context);

	return (
		<>
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
					placeholder='пароль'
					value={password}
					onChange={e => setPassword(e.target.value)}
					className='inputForm'
				/>
				<button
					onClick={() => store.login(email, password)}
					className='btnForm'
				>
					Логин
				</button>
				<button
					onClick={() => store.registration(email, password)}
					className='btnForm'
				>
					Регистрация
				</button>
			</div>
		</>
	);
}

export default observer(LoginForm);