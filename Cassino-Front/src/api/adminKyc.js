import { adminApiFetch, adminFetchBlobUrl } from './adminHttp';

export const getKycQueue = ({ status = 'pending', page } = {}) => {
  const params = new URLSearchParams({ status });
  if (page) params.set('page', page);
  return adminApiFetch(`/admin/users/kyc?${params.toString()}`);
};

export const approveKyc = (userId) =>
  adminApiFetch(`/admin/users/${userId}/kyc/approve`, { method: 'POST' });

export const rejectKyc = (userId, reason) =>
  adminApiFetch(`/admin/users/${userId}/kyc/reject`, { method: 'POST', body: { reason } });

/* Documento não tem URL pública (ver AdminKycController::document no
   backend) — precisa ser buscado autenticado e virar blob URL local. */
export const getKycDocumentBlobUrl = (userId, documentId) =>
  adminFetchBlobUrl(`/admin/users/${userId}/kyc/documents/${documentId}`);
