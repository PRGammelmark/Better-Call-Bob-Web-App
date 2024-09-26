import { createContext, useReducer, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { user: action.payload };
        case 'LOGOUT':
            return { user: null };
        default:
            return state;
    }
}

export const AuthContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null
    });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user')); // Get user info
        const token = user.token;

        console.log('Initial Token:', token);
        console.log('Initial User:', user);

        if (token) {
            try {
                const decoded = jwtDecode(token); // Decode the JWT
                const isExpired = decoded.exp * 1000 < Date.now(); // Check if expired

                console.log('Decoded JWT:', decoded);
                console.log('Is Token Expired:', isExpired);

                if (isExpired) {
                    console.log('Token expired. Logging out...');
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
            console.log('No token found. User is logged out.');
            dispatch({ type: 'LOGOUT' }); // Logout if no token is found
        }
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
}

// OLD AUTHCONTEXT WITHOUT TOKEN CHECK & AUTOMATIC LOGOUT //

// import { createContext, useReducer, useEffect } from "react";


// export const AuthContext = createContext();

// export const authReducer = (state, action) => {
//     switch (action.type) {
//         case 'LOGIN':
//             return { user: action.payload }
//         case 'LOGOUT':
//             return { user: null }
//         default:
//             return state
//     }
// }

// export const AuthContextProvider = ({ children }) => {
//     const [state, dispatch] = useReducer(authReducer, {
//         user: null
//     });

//     useEffect(() => {
//         const user = JSON.parse(localStorage.getItem('user'))

//         if (user) {
//             dispatch({ type: 'LOGIN', payload: user })
//         }
//     }, [])

//     return (
//         <AuthContext.Provider value={{...state, dispatch}}>
//             { children }
//         </AuthContext.Provider>
//     )
// }