import { Link } from 'react-router-dom';
import { HouseLogo, Login, Map } from '../../shared/icons';
import { useContext } from 'react';
import { Context } from '../../app/main';
import { observer } from 'mobx-react-lite';
import './Header.scss';

const Header = () => {

	const { store } = useContext(Context);

	const getLatestApart = () => {
		const years = new Date().getFullYear();
		return `/apartments?houseDate=${years - 5}-${years}`;
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
						<Link className="nav__list-link not-hover" to='/create-apartment'>
							<button className="btn">Новое обновление</button>
						</Link>
						{
							store.isAuth
								? <Link className="nav__list-link auth not-hover" to='/profile'><p>{store.user.name}</p></Link>
								: <Link className="nav__list-link auth not-hover" to='/auth'><Login color='#999999' /> <p>Войти</p></Link>
						}
						{
							store.user.role == "ADMIN"
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
						<li className="nav__list-item"><Link className="nav__list-link" to='/apartments'>Покупка</Link></li>
						<li className="nav__list-item"><Link className="nav__list-link" to='/apartments?status=1'>Аренда</Link></li>
						<li className="nav__list-item"><Link className="nav__list-link" to={`${getLatestApart()}`}>Новостройки</Link></li>
						<li className="nav__list-item"><Link className="nav__list-link" to='/agents'>Риелторы</Link></li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default observer(Header);