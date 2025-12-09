import { Routes, Route } from "react-router";
import { Navigate } from 'react-router-dom';
import { Admin, Apartment, Apartments, CreateApartment, Main } from '../../pages';
import { Auth } from '../../widget';
import { type JSX, useContext } from 'react';
import { Context } from '../main';

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: string; }) => {
	const { store } = useContext(Context);

	//Если пользователь не авторизован
	if (!store.user) {
		return <Navigate to="/auth" replace />;
	}

	// Если требуется определенная роль и у пользователя ее нет
	if (requiredRole && store.user.role !== requiredRole) {
		return <Navigate to="/auth" replace />;
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
					<Route path='/apartments/search' element={<Apartments />} />
					<Route path='/apartments/:id' element={<Apartment />} />
					<Route path='/agents' element={<Apartments />} />
					<Route path='/agents/:id' element={<Apartment />} />
					<Route path='/auth' element={<Auth />} />
					<Route path='/profile' element={
						<Auth />
					}
					/>
					<Route path='/admin' element={
						<ProtectedRoute requiredRole='ADMIN'>
							<Admin />
						</ProtectedRoute>}
					/>
					<Route path='/create-apartment' element={
						<ProtectedRoute requiredRole='AGENT'>
							<CreateApartment />
						</ProtectedRoute>
					} />
					<Route path='/edit-apartment/:id' element={
						<ProtectedRoute requiredRole='AGENT'>
							<CreateApartment />
						</ProtectedRoute>
					} />

					<Route
						path="*"
						element={<Navigate to="/" replace />}
					/>
				</Routes>
			</div>
		</div>
	);
};