import { useState, useEffect } from "react";
import type { Product} from "../types";
import { ListItem } from "./ListItem";
import { ItemForm } from "./ItemForm";
import styles from "./ShoppingList.module.css";

export function ShoppingList({ filter }: { filter: string }) {
	const [products, setProducts] = useState<Product[]>(() => {
		const saved = localStorage.getItem("list");
		return saved ? JSON.parse(saved) : [];
	});
	const [isAdding, setIsAdding] = useState(false);

	const filteredProducts = products.filter(p => {
		switch (filter) {
			case "not bought":
				return !p.bought;
			case "bought":
				return p.bought;
			default:
				return products;
		}
	})

	useEffect(() => {
		localStorage.setItem("list", JSON.stringify(products));
	}, [products])

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
		<section className={styles.listSection}>
			{!isAdding ? (
				<button className={styles.addItemButton} onClick={() => setIsAdding(true)}>
					+ New item
				</button>
			) : (
				<ItemForm onConfirm={handleAdd} onCancel={() => setIsAdding(false)} />
			)}
			<div className={styles.listContainer}>
				{[...filteredProducts]
					.sort((a, b) => Number(a.bought) - Number(b.bought))
					.map(p => (
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
	);
}
