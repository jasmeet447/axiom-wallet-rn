import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setUser, clearUser } from '../../../store/slices/authSlice';
import type { User } from '../../../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, biometricEnabled } =
    useAppSelector(state => state.auth);

  const login = (_user: User) => {
    dispatch(setUser(_user));
  };

  const logout = () => {
    dispatch(clearUser());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    biometricEnabled,
    login,
    logout,
  };
};
