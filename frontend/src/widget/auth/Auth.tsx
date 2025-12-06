import { useContext } from 'react';
import { observer } from "mobx-react-lite";
import "./Auth.scss";
import { Context } from '../../app/main';
import LoginForm from '../../features/loginForm/LoginForm';

function Auth() {

	const { store } = useContext(Context);

	if (!store.isAuth) {
		return (
			<LoginForm />
		);
	}

	return (
		<>
			<div className="profile">

				<button
					onClick={() => store.logout()}
					className='btnForm'
				>Выйти</button>
			</div>
		</>
	);
}

export default observer(Auth);