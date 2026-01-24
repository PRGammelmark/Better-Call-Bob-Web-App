import { createContext, useReducer, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload };
        case 'LOGOUT':
            return { user: null };
        case 'UPDATE_USER':
            return { user: action.payload }; // <- NY linje
        default:
            return state;
    }
}

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null
    });
    
    const [authIsReady, setAuthIsReady] = useState(false)

    const updateUser = (updatedUser) => {
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };
    
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user')); // Get user info

        if (user && user.token) {
            const token = user.token;
            try {
                const decoded = jwtDecode(token); // Decode the JWT
                const isExpired = decoded.exp * 1000 < Date.now(); // Check if expired
                if (isExpired) {
                    dispatch({ type: 'LOGOUT' }); // Logout if expired
                    localStorage.removeItem('user'); // Clear user data
                    localStorage.removeItem('jwt'); // Clear expired token
                } else {
                    if (user) {
                        dispatch({ type: 'LOGIN', payload: user }); // Login user if token is valid
                    }
                }
            } catch (error) {
                console.error("Invalid token:", error);
                dispatch({ type: 'LOGOUT' }); // Logout on error
                localStorage.removeItem('user'); // Clear user data
                localStorage.removeItem('jwt'); // Clear invalid token
            }
        } else {
            // console.log('No user or token found. User is logged out.');
            dispatch({ type: 'LOGOUT' }); // Logout if no token is found
        }

        setAuthIsReady(true);
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, dispatch, authIsReady, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}