import { Link } from 'react-router-dom';
import { HouseLogo, Login, Map } from '../../shared/icons';
import './Header.scss';
import { useContext, useEffect } from 'react';
import { Context } from '../../app/main';
import { observer } from 'mobx-react-lite';


const Header = () => {

	const { store } = useContext(Context);

	useEffect(() => {
		if (localStorage.getItem('token')) {
			store.checkAuth();
		}
	}, []);



	return (
		<div className='header'>
			<div className="header-up">
				<div className="container">
					<div className="header-up-container">
						<div className="location">
							<Map color='#999999' />
							<p>Санкт-Петербург</p>
						</div>
						<Link className="nav__list-link auth not-hover" to='/auth'>
							{
								store.isAuth
									? <p>{store.user.email}</p>
									: <><Login color='#999999' /> <p>Войти</p></>
							}
						</Link>
						{
							store.user.role == "admin"
								? <li className="nav__list-item"><Link className="nav__list-link" to='/admin'>Админ</Link></li>
								: null
						}
					</div>
				</div>
			</div>
			<div className="header-main">
				<div className="container">
					<ul className="nav__list">
						<li className="nav__list-item">
							<Link className="nav__list-link logo not-hover" to='/'>
								<HouseLogo color='#02bf02ff' height={'45px'} width={'45px'} viewBox='0 0 25 25' />
								<p>ООО "Бнал"</p>
							</Link>
						</li>
						<li className="nav__list-item"><Link className="nav__list-link" to='/'>Покупка</Link></li>
						<li className="nav__list-item"><Link className="nav__list-link" to='/news'>Аренда</Link></li>
						<li className="nav__list-item"><Link className="nav__list-link" to='/calendar'>Новостройки</Link></li>
						<li className="nav__list-item"><Link className="nav__list-link" to='/studboard'>Риелторы</Link></li>
						<li className="nav__list-item"><Link className="nav__list-link" to='/contacts'>Журнал</Link></li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default observer(Header);