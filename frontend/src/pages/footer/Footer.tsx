import "./footer.scss";
import { Link } from "react-router-dom";

export const Footer = () => {
	return (
		<div className="footer">
			<div className="container">
				<div className="footer__content">
					<ul className="footer__left-list">
						<li className="footer__list-item"><Link className="footer__link" to='/apartments/search?status=0'>Покупка</Link></li>
						<li className="footer__list-item"><Link className="footer__link" to='/apartments/search?status=1'>Аренда</Link></li>
						<li className="footer__list-item"><Link className="footer__link" to={`/apartments/search?minHouseDate=${new Date().getFullYear() - 5}&maxHouseDate=${new Date().getFullYear()}`}>Новостройки</Link></li>
						<li className="footer__list-item"><Link className="footer__link" to='/agents'>Агенты</Link></li>
					</ul>
					<ul className="footer__mid-list">
						<li className="footer__list-item text">
							<p>© 2016–2025, ООО «Бнал»
								Санкт-Петербург, 121170, Попова, д. 32, к. 1, ОГРН: 1564646546433 ИНН: 1545153464</p>
							<p>Сервис применяет рекомендательные технологии: предоставляет информацию на основе сбора, систематизации и анализа сведений, относящихся к предпочтениям пользователей интернета, находящихся в России</p>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};