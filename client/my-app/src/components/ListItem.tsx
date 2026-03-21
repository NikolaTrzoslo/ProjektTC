import { useState } from "react";
import type { Product } from "../types";
import { ItemForm } from "./ItemForm";
import styles from "./ListItem.module.css";

interface ListItemProps {
	product: Product;
	onDelete: (id: string) => void;
	onUpdate: (id: string, name: string, quantity: number) => void;
	onToggleBought: (id: string) => void;
}

export function ListItem({ product, onDelete, onUpdate, onToggleBought }: ListItemProps) {
	const [isEditing, setIsEditing] = useState(false)

	if (isEditing) {
		return (
			<ItemForm 
				initialData={product}
				onCancel={() => setIsEditing(false)}
				onConfirm={(name, quantity) => {
					onUpdate(product.id, name, quantity);
					setIsEditing(false);
				}}
			/>
		);
	}

	return (
		<div className={styles.productRow}
			onClick={() => onToggleBought(product.id)}
		>
			<div className={styles.infoGroup}>
				<input className={styles.check}
					type="checkbox"
					checked={product.bought}
					onChange={() => onToggleBought(product.id)}
					onClick={e => e.stopPropagation()}
				/>
				<span className={product.bought ? styles.bought : styles.notBought}>
					{product.name} x{product.quantity}
				</span>
			</div>
			<div className={styles.controls}
				onClick={e => e.stopPropagation()}
			>
				<button className={styles.button} onClick={() => setIsEditing(true)}>{"\uf448"}</button>
				<button className={`${styles.button} ${styles.removeButton}`} onClick={() => onDelete(product.id)}>{"\uf48e"}</button>
			</div>
		</div>
	);
}
