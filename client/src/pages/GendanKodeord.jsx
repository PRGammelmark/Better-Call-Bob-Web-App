import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from "./GendanKodeord.module.css";

const GendanKodeord = () => {
    const [firstPassword, setFirstPassword] = useState("");
    const [secondPassword, setSecondPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Extract the token from the URL
    const token = searchParams.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!firstPassword || !secondPassword) {
            setError("Begge felter skal udfyldes.");
            setTimeout(() => setError(""), 5000);
            return;
        }
        if (firstPassword !== secondPassword) {
            setError("Kodeordene matcher ikke.");
            setTimeout(() => setError(""), 5000);
            return;
        }
        if (firstPassword.length < 6) {
            setError("Kodeordet skal være mindst 6 tegn langt.");
            setTimeout(() => setError(""), 5000);
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/password/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: firstPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Noget gik galt.");
            }

            setSuccess("Dit kodeord er blevet ændret!");
            setTimeout(() => navigate("/login"), 2000); // Redirect to login after 2 sec
        } catch (err) {
            setError(err.message);
            setTimeout(() => setError(""), 5000);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <h1 className={styles.heading}>Gendan kodeord</h1>

                <label className={styles.label}>Nyt kodeord:</label>
                <input className={styles.input} type="password" onChange={(e) => setFirstPassword(e.target.value)} value={firstPassword} />

                <label className={styles.label}>Gentag kodeord:</label>
                <input className={styles.input} type="password" onChange={(e) => setSecondPassword(e.target.value)} value={secondPassword} />

                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

                <button className={styles.button} type="submit">Indstil nyt kodeord</button>
            </form>
        </div>
    );
};

export default GendanKodeord;
