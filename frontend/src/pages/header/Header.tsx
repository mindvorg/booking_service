import { Link } from 'react-router-dom';
import { HouseLogo, Login, Map } from '../../shared/icons';
import './Header.scss';

interface HeaderProps {
	className?: string;
}

export const Header = ({ className }: HeaderProps) => {
	return (
		<div className='header'>
			<div className="container">
				<div className="header-up">
					<div className="location">
						<Map color='#999999' />
						<p>Санкт-Петербург</p>
					</div>
					<div className="auth">
						<Login color='#999999' />
						<p>Войти</p>
					</div>
				</div>
				<div className="header-main">
					<ul className="nav__list">
						<li className="nav__list-item">
							<div className="logo">
								<Link className="nav__list-link" to='/'>
									<HouseLogo height={'60px'} width={'60px'} viewBox='0 0 25 25' />
									<p>ООО "Бнал"</p>
								</Link>
							</div>
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