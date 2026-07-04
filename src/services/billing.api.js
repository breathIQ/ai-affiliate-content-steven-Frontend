import API from "./api";

export const getStripeConfig = async () => {
  const res = await API.get(`/config/stripe-key`);
  return res.data;
};

export const getBalance = async () => {
  const res = await API.get(`/user/billing/balance`);
  return res.data;
};

export const createSetupIntent = async () => {
  const res = await API.post(`/user/billing/setup-intent`);
  return res.data;
};

export const savePaymentMethod = async (paymentMethodId) => {
  const res = await API.post(`/user/billing/payment-method`, {
    payment_method_id: paymentMethodId,
  });
  return res.data;
};

export const purchaseCredits = async (credits) => {
  const res = await API.post(`/user/billing/purchase-credits`, { credits });
  return res.data;
};

export const updateAutoRecharge = async ({ enabled, threshold, topupCredits }) => {
  const res = await API.post(`/user/billing/auto-recharge`, {
    enabled,
    threshold,
    topup_credits: topupCredits,
  });
  return res.data;
};

export const getTransactions = async () => {
  const res = await API.get(`/user/billing/transactions`);
  return res.data;
};
