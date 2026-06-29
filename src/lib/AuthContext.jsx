
import React, { createContext, useContext, useState, useEffect } from 'react';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
 const [user,setUser]=useState(null);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{ const s=localStorage.getItem('auth_user'); if(s) setUser(JSON.parse(s)); setLoading(false); },[]);
 const login=(u)=>{setUser(u); localStorage.setItem('auth_user',JSON.stringify(u));};
 const logout=()=>{setUser(null); localStorage.removeItem('auth_user'); localStorage.removeItem('auth_token'); window.location.href='/login';};
 const checkUserAuth=()=>{const s=localStorage.getItem('auth_user'); if(s) setUser(JSON.parse(s));};
 const navigateToLogin=()=>window.location.href='/login';
 return <AuthContext.Provider value={{user,isAuthenticated:!!user,login,logout,checkUserAuth,navigateToLogin,isLoadingAuth:loading,isLoadingPublicSettings:false,authError:null}}>{children}</AuthContext.Provider>
}
export const useAuth=()=>useContext(AuthContext);
