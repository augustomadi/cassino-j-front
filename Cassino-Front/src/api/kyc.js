import { apiFetch } from './http';

export const getKycStatus = () => apiFetch('/me/kyc');

/* multipart/form-data — documents[selfie], documents[id_front], documents[id_back] */
export const submitKyc = ({ selfie, idFront, idBack }) => {
  const form = new FormData();
  form.append('documents[selfie]', selfie);
  form.append('documents[id_front]', idFront);
  form.append('documents[id_back]', idBack);
  return apiFetch('/me/kyc', { method: 'POST', body: form });
};
