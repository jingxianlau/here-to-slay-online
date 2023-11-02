import { useContext } from 'react';
import { ClientStateContext } from '../context/ClientStateContext';

const useClientContext = () => {
  return useContext(ClientStateContext);
};

export default useClientContext;
