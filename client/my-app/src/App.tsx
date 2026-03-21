import { ShoppingList } from "./components/ShoppingList";
import { Menu } from "./components/Menu"
import styles from "./App.module.css";
import { useState } from "react";

function App() {
	const [displayMenu, setDisplayMenu] = useState(false);
	const toggleMenu = () => {
		displayMenu ? setDisplayMenu(false) : setDisplayMenu(true);
	}
	const [selectedOption, setOption] = useState("all");

	return (
	<main>
		<div className={styles.menu}>
			<button className={styles.menuButton} 
				onClick={() => toggleMenu()}
			>
				{"\udb80\udf5c"}
			</button>
			{displayMenu ? <Menu selectedOption={selectedOption} setOption={setOption} /> : null}
		</div>
		<h1 className={styles.title}>Shopping List</h1>
		<ShoppingList filter={selectedOption} />
	</main>
	);
}

export default App;
