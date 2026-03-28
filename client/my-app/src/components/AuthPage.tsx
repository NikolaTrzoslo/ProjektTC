import styles from "./AuthPage.module.css"
import { useEffect, useState } from "react"

type AuthDisplayProps = {
	setDisplayAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AuthPage( { setDisplayAuth }: AuthDisplayProps ) {
	const [isRegistered, setRegistered] = useState(
		() => localStorage.getItem("isRegistered") === "true"
	);

	const handleRegister = () => {
		localStorage.setItem("isRegistered", "true");
		setRegistered(true);
	}

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rePassword, setRePassword] = useState("");

	const [canConfirm, setCanConfirm] = useState(false);

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

	useEffect(() => {
		const validEmail 		= emailRegex.test(email);
		const passwordLength 	= password.length >= 12;
		const hasLowerCase		= /[a-z]/.test(password);
		const hasUpperCase		= /[A-Z]/.test(password);
		const hasNumber 		= /\d/.test(password);
		const hasSpecialChar 	= /[!@#$%^&*]/.test(password);
		const onlyAllowed 		= /^[A-Za-z0-9!@#$%^&*]+$/.test(password);

		if (
			validEmail &&
			passwordLength &&
			hasLowerCase &&
			hasUpperCase &&
			hasNumber &&
			hasSpecialChar &&
			onlyAllowed &&
			(isRegistered || password === rePassword)
		) {
			setCanConfirm(true);
		} else {
			setCanConfirm(false);
		}
	}, [email, password, rePassword, isRegistered]);

	const [showPassword, setShowPassword] = useState(false);

	let title;
	let repeatPassword;
	let confirmButton;

	if (isRegistered) {
		title			= <h2 className={styles.title}>Sign in</h2>;
		repeatPassword	= null;
		confirmButton	= <button className={styles.confirmButton} disabled={!canConfirm}>Sign in</button>
	} else {
		title			= <h2 className={styles.title}>Sign up</h2>;
		repeatPassword	= (
			<>
						  <label className={styles.label}>repeat password</label>
						  <input
						  	className={styles.inputField}
							type={showPassword ? "text" : "password"}
							onChange={(e) => setRePassword(e.target.value.trim())}
						  />
			</>
		);
		confirmButton	= <button
							className={styles.confirmButton}
							onClick={handleRegister}
							disabled={!canConfirm}
						  >
							Sign up
						  </button>;
	}

	return (
		<div className={styles.container}>
			<section className={styles.authForm}>
				{title}

				<label className={styles.label}>e-mail</label>
				<input
					className={styles.inputField}
					type="text"
					onChange={(e) => setEmail(e.target.value)}
				/>

				<label className={styles.label}>password</label>
				<div className={styles.passwordRow}>
					<input
						className={styles.inputField}
						type={showPassword ? "text" : "password"}
						onChange={(e) => setPassword(e.target.value.trim())}
					/>
					<button
						className={styles.eyeButton}
						onClick={() => {
							showPassword ? setShowPassword(false) : setShowPassword(true)
						}}
					>
						{showPassword ? "\udb80\ude09" : "\udb80\ude08"}
					</button>
				</div>
				{repeatPassword}

				<div className={styles.buttonRow}>
					<button className={styles.cancelButton} onClick={() => setDisplayAuth(false)}>
						Cancel
					</button>
					{confirmButton}
				</div>
			</section>
		</div>
	)
}
