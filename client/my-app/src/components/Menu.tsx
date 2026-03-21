import styles from "./Menu.module.css";

type MenuProps = {
	selectedOption: string;
	setOption: (option: string) => void;
}

export function Menu( { selectedOption, setOption }: MenuProps ) {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setOption(e.target.value);
	}

	return (
		<div className={styles.container}>
			{/* <button className={styles.loginButton}>
				<span className={styles.userIcon}>{"\uf007"}</span> Login
			</button> */}
			<label className={styles.filterLabel}>{"\uf0b0"} Filter</label>
			<div className={styles.radioGroup}>
				<label>
					<input
						type="radio"
						name="filter"
						value="all"
						checked={selectedOption === "all"}
						onChange={handleChange}
					/>
					<span className={styles.radioDot}></span> Show all
				</label>
				<label>
					<input
						type="radio"
						name="filter"
						value={"not bought"}
						checked={selectedOption === "not bought"}
						onChange={handleChange}
					/>
					<span className={styles.radioDot}></span> Hide bought
				</label>
				<label>
					<input
						type="radio"
						name="filter"
						value="bought"
						checked={selectedOption === "bought"}
						onChange={handleChange}
					/>
					<span className={styles.radioDot}></span> Bought only
				</label>
			</div>
		</div>
	)
}
