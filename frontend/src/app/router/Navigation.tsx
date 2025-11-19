import { Routes, Route } from "react-router";
import { Navigate } from 'react-router-dom';
import { Admin, Apartment, Apartments, Main, } from '../../pages';
import { Auth } from '../../widget';
import { type JSX, useContext } from 'react';
import { Context } from '../main';

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: string; }) => {
	const { store } = useContext(Context);

	// Если пользователь не авторизован
	if (!store.user) {
		return <Navigate to="/auth" replace />;
	}

	// Если требуется определенная роль и у пользователя ее нет
	if (requiredRole && store.user.role !== requiredRole) {
		return <Navigate to="/" replace />;
	}

	return children;
};

export const Navigation = () => {
	return (
		<div className="navigation">
			<div className="container">
				<Routes>
					<Route path='/' element={<Main />} />
					<Route path='/apartments' element={<Apartments />} />
					<Route path='/apartments/:id' element={<Apartment />} />
					<Route path='/auth' element={<Auth />} />
					<Route path='/admin' element={
						<ProtectedRoute requiredRole="Админ">
							<Admin />
						</ProtectedRoute>} />
					<Route
						path="*"
						element={<Navigate to="/" replace />}
					/>
				</Routes>
			</div>
		</div>
	);
};