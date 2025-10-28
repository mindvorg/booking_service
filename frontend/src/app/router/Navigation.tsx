import { Routes, Route } from "react-router";
import { Navigate } from 'react-router-dom';
import { Main } from '../../pages';

interface NavigationProps {
	className?: string;
}

export const Navigation = ({ className }: NavigationProps) => {
	return (
		<Routes>
			<Route path='/' element={<Main />} />
			<Route
				path="*"
				element={<Navigate to="/" replace />}
			/>
		</Routes>
	);
};