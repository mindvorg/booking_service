import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HouseLogo, Login, Map } from '../../shared/icons';
import { useContext } from 'react';
import { Context } from '../../app/main';
import { observer } from 'mobx-react-lite';
import './Header.scss';

const Header = () => {

	const { store } = useContext(Context);
	const navigate = useNavigate();
	const location = useLocation();

	const handleLogout = async () => {
		await store.logout();
		if (location.pathname === '/profile') {
			// Заменяем текущий URL на /auth без добавления в историю
			navigate('/auth', { replace: true });
		}

	};

	return (
		<div className='header'>
			<div className="header-up">
				<div className="container">
					<div className="header-up-container">
						<div className="location">
							<Map color='#999999' />
							<p>Санкт-Петербург</p>
						</div>
						{
							store.user.role == "AGENT"
								? <Link className="nav__list-link not-hover" to='/create-apartment'>
									<button className="header-up-container-btn">+ Новое обновление</button>
								</Link>
								: null
						}
						{
							store.isAuth
								? <button className="header-up-container-btn-logout" onClick={() => handleLogout()}>Выйти</button>
								: null
						}
						{
							store.isAuth
								? <Link className="nav__list-link auth not-hover" to='/profile'><p>{store.user.name}</p></Link>
								: <Link className="nav__list-link auth not-hover" to='/auth'><Login color='#999999' /> <p>Войти</p></Link>
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
						<li className="nav__list-item"><Link className="nav__list-link" to='/apartments/search?status=0'>Покупка</Link></li>
						<li className="nav__list-item"><Link className="nav__list-link" to='/apartments/search?status=1'>Аренда</Link></li>
						<li className="nav__list-item"><Link className="nav__list-link" to={`/apartments/search?minHouseDate=${new Date().getFullYear() - 5}&maxHouseDate=${new Date().getFullYear()}`}>Новостройки</Link></li>
						<li className="nav__list-item"><Link className="nav__list-link" to='/agents'>Агенты</Link></li>
						{
							store.user.role == "ADMIN"
								? <li className="nav__list-item"><Link className="nav__list-link" to='/admin'>Админ</Link></li>
								: null
						}
					</ul>
				</div>
			</div>
		</div>
	);
};

export default observer(Header);