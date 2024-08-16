import { useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export const useSignup = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(null);
    const [succes, setSucces] = useState(false);
    // const { dispatch } = useAuthContext();

    const signup = async (navn, adresse, telefon, email, password) => {
        setLoading(true)
        setError(null)

        const response = await fetch('http://localhost:3000/api/brugere/signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ navn, adresse, telefon, email, password })
        })

        const json = await response.json();

        if (!response.ok) {
            setLoading(false)
            setError(json.error)
        }
        if(response.ok) {
            // // save the user to local storage
            // localStorage.setItem('user', JSON.stingify(json))

            // // update the auth context
            // dispatch({type: 'LOGIN', payload: json})

            setLoading(false)
            setError(null);
            setSucces(true);
            console.log("Succes! User registered.")
        }
    }

    return { signup, loading, error, succes, setSucces}
}