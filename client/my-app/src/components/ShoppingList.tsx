import { useState, useEffect } from "react";
import type { Product} from "../types";
import { ListItem } from "./ListItem";
import { ItemForm } from "./ItemForm";
import styles from "./styles/ShoppingList.module.css";

type ShoppingListProps = {
	filter: string;
	userIsLoggedIn: boolean;
}

export function ShoppingList({ filter, userIsLoggedIn }: ShoppingListProps) {
	const [products, setProducts] = useState<Product[]>([]);
	const [isAdding, setIsAdding] = useState(false);
	const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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

	// Helper to map backend product to frontend Product type
	function mapProduct(p: any): Product {
		return {
			id: p._id || p.id,
			name: p.name,
			quantity: p.quantity,
			bought: p.bought
		};
	}

	// check for token and fetch products from backend if logged in
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			fetch(`${API_BASE}/products`, {
				headers: { "Authorization": `Bearer ${token}` }
			})
			.then(res => res.ok ? res.json() : Promise.reject())
			.then(data => Array.isArray(data) ? setProducts(data.map(mapProduct)) : setProducts([]))
			.catch(() => setProducts([]));
		} else {
			const saved = localStorage.getItem("list");
			setProducts(saved ? JSON.parse(saved) : []);
		}
	}, [userIsLoggedIn]);

	// save to localStorage only if not logged in
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			localStorage.setItem("list", JSON.stringify(products));
		}
	}, [products]);

	const handleAdd = (name: string, quantity: number) => {
		if (!name.trim()) return;
		if (userIsLoggedIn) {
			const token = localStorage.getItem("token");
			fetch(`${API_BASE}/products`, {
				method: "POST",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ name, quantity })
			})
			.then(res => res.ok ? res.json() : Promise.reject())
			.then(() => {
				// Refetch products from backend to update UI
				fetch(`${API_BASE}/products`, {
					headers: { "Authorization": `Bearer ${token}` }
				})
				.then(res => res.ok ? res.json() : Promise.reject())
				.then(data => Array.isArray(data) ? setProducts(data.map(mapProduct)) : setProducts([]));
				setIsAdding(false);
			})
			.catch(() => {
				setIsAdding(false);
			});
		} else {
			const newProduct: Product = {
				id: crypto.randomUUID(),
				name,
				quantity,
				bought: false
			};
			setProducts([newProduct, ...products]);
			setIsAdding(false);
		}
	};

	const handleUpdate = (id: string, name: string, quantity: number) => {
		if (userIsLoggedIn) {
			const token = localStorage.getItem("token");
			fetch(`${API_BASE}/products/${id}`, {
				method: "PATCH",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ name, quantity })
			})
			.then(res => res.ok ? res.json() : Promise.reject())
			.then(() => {
				fetch(`${API_BASE}/products`, {
					headers: { "Authorization": `Bearer ${token}` }
				})
				.then(res => res.ok ? res.json() : Promise.reject())
				.then(data => Array.isArray(data) ? setProducts(data.map(mapProduct)) : setProducts([]));
			})
			.catch(() => {/* TODO: show error */});
		} else {
			setProducts(prev => prev.map(p => p.id === id ? { ...p, name, quantity } : p));
		}
	};

	const handleDelete = (id: string) => {
		if (userIsLoggedIn) {
			const token = localStorage.getItem("token");
			fetch(`${API_BASE}/products/${id}`, {
				method: "DELETE",
				headers: { "Authorization": `Bearer ${token}` }
			})
			.then(res => {
				if (res.ok) {
					return fetch(`${API_BASE}/products`, {
						headers: { "Authorization": `Bearer ${token}` }
					})
					.then(res => res.ok ? res.json() : Promise.reject())
					.then(data => Array.isArray(data) ? setProducts(data.map(mapProduct)) : setProducts([]));
				} else {
					// TODO: show error
				}
			})
			.catch(() => {/* TODO: show error */});
		} else {
			setProducts(prev => prev.filter(p => p.id !== id));
		}
	};

	const toggleBought = (id: string) => {
		if (userIsLoggedIn) {
			const token = localStorage.getItem("token");
			// Find the product to get its current bought state
			const product = products.find(p => p.id === id);
			if (!product) return;
			fetch(`${API_BASE}/products/${id}`, {
				method: "PATCH",
				headers: {
					"Authorization": `Bearer ${token}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ bought: !product.bought })
			})
			.then(res => res.ok ? res.json() : Promise.reject())
			.then(() => {
				fetch(`${API_BASE}/products`, {
					headers: { "Authorization": `Bearer ${token}` }
				})
				.then(res => res.ok ? res.json() : Promise.reject())
				.then(data => Array.isArray(data) ? setProducts(data.map(mapProduct)) : setProducts([]));
			})
			.catch(() => {/* TODO: show error */});
		} else {
			setProducts(prev => prev.map(p => p.id === id ? { ...p, bought: !p.bought } : p));
		}
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
