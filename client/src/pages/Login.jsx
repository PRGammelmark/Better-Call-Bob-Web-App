import React, { useState, useEffect } from 'react'
import styles from "./Login.module.css"
import { useLogin } from "../hooks/useLogin.js"

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, error, isLoading } = useLogin()

    const handleSubmit = async (e) => {
        e.preventDefault();

        await login(email, password)
    }

  return (
    <div className={styles.loginContainer}>
      <form action="" className={styles.loginForm} onSubmit={handleSubmit}>
        <h1 className={styles.heading}>Log ind</h1>
        <label className={styles.label}>Email:</label>
        <input className={styles.input} type="email" onChange={(e) => setEmail(e.target.value)} value={email} />
        <label className={styles.label}>Kodeord:</label>
        <input className={styles.input} type="password" onChange={(e) => setPassword(e.target.value)} value={password} />
        <button className={styles.button} disabled={isLoading}>Log ind</button>
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  )
}

export default Login
