import React, { useState, useEffect } from 'react'
import styles from "./Login.module.css"
import { useLogin } from "../hooks/useLogin.js"
import GlemtKodeord from "../components/modals/GlemtKodeord.jsx"

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, error, isLoading } = useLogin()
    const [glemtKodeordModal, setGlemtKodeordModal] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault();

        await login(email, password)
    }

  return (
    <div className={styles.loginContainer}>
      <form action="" className={styles.loginForm} onSubmit={handleSubmit} autoComplete="on">
        <h1 className={styles.heading}>Log ind</h1>
        <label className={styles.label}>Email:</label>
        <input className={styles.input} type="email" name="email" autoComplete="email" onChange={(e) => setEmail(e.target.value)} value={email} />
        <label className={styles.label}>Kodeord:</label>
        <input className={styles.input} type="password" name="password" autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} value={password} />
        <button className={styles.button} disabled={isLoading}>Log ind</button>
        <button className={styles.secondaryButton} onClick={() => setGlemtKodeordModal(true)} type="button">Glemt kodeord?</button>
        {error && <div className={styles.error}>{error}</div>}
      </form>
      <GlemtKodeord trigger={glemtKodeordModal} setTrigger={setGlemtKodeordModal} />
    </div>
  )
}

export default Login