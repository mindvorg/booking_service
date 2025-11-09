import { useState, type FormEvent, } from "react";
import "./SearchField.scss";

// Типы для пропсов компонента
interface SearchProps {
	onSearch: (searchTerm: string, filters?: Record<string, any>) => void;
	onReset: () => void;
	placeholder?: string;
	className?: string;
}

export const SearchField = ({
	onSearch,
	onReset,
	placeholder = "Поиск...",
	className = ""
}: SearchProps) => {
	const [searchTerm, setSearchTerm] = useState<string>("");

	// Обработчик отправки формы
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSearch(searchTerm);
	};

	// Обработчик сброса
	const handleReset = () => {
		setSearchTerm("");
		onReset();
	};

	return (
		<div className="search-field">
			<div className="search-field-title">Поиск недвижимости</div>
			<form
				className={`search-form ${className}`}
				onSubmit={handleSubmit}
				onReset={handleReset}
			>
				<div className="search-input-wrapper">
					<input
						type="text"
						className="search-input"
						placeholder={placeholder}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>

					<div className="search-buttons">
						<button
							type="submit"
							className="search-button search-button--primary"
						>
							Найти
						</button>

						<button
							type="button"
							className="search-button search-button--secondary"
							onClick={handleReset}
							disabled={!searchTerm}
						>
							Сбросить
						</button>
					</div>
				</div>
			</form>
		</div>

	);
};