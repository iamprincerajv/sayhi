import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthWrapper = ({ children, authentication = false }) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();

    useEffect(() => {
        if (user && !authentication) {
            navigate('/');
        } else if (!user && authentication) {
            navigate('/signin');
        }
    }, [user, navigate, authentication]);

  return (
    <>
    {children}
    </>
  )
}

export default AuthWrapper
