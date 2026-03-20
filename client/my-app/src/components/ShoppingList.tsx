import { useState } from "react";
import type { Product } from "../types";
import { ListItem } from "./ListItem";
import { ItemForm } from "./ItemForm";
import styles from "./ShoppingList.module.css";

// Add two top-right buttons (example: Settings and Help)

export function ShoppingList() {
	const [products, setProducts] = useState<Product[]>([]);
	const [isAdding, setIsAdding] = useState(false);

	const handleAdd = (name: string, quantity: number) => {
		if (!name.trim()) return;
		const newProduct: Product = {
			id: crypto.randomUUID(),
			name,
			quantity,
			bought: false
		};
		setProducts([newProduct, ...products]);
		setIsAdding(false);
	};

	const handleUpdate = (id: string, name: string, quantity: number) => {
		setProducts(prev => prev.map(p => p.id === id ? { ...p, name, quantity } : p));
	};

	const handleDelete = (id: string) => {
		setProducts(prev => prev.filter(p => p.id !== id));
	};

	const toggleBought = (id: string) => {
		setProducts(prev => prev.map(p => p.id === id ? { ...p, bought: !p.bought } : p));
	};

	return (
		<>
			<div className={styles.menu}>
				<button className={styles.menuButton}>{"\udb80\udf5c"}</button>
			</div>
			<section className={styles.listSection}>
				{!isAdding ? (
					<button className={styles.addItemButton} onClick={() => setIsAdding(true)}>+ New item</button>
				) : (
					<ItemForm onConfirm={handleAdd} onCancel={() => setIsAdding(false)} />
				)}
				<div className={styles.listContainer}>
					{products.map(p => (
						<ListItem 
							key={p.id} 
							product={p} 
							onDelete={handleDelete} 
							onUpdate={handleUpdate}
							onToggleBought={toggleBought}
						/>
					))}
				</div>
			</section>
		</>
	);
}
