// src/services/profile.mapper.js
export const mapProfileResponse = (response, roleId) => {
  const data = response.data;

  // USER
  if (roleId === 2) {
    return {
      name: data.name,
      email: data.email,
      affiliate_id: data.affiliate_id,
      affiliate_link: data.affiliate_link,
      amazon_link: data.amazon_link,
      other_affiliate_id: data.other_affiliate_id,
      affiliate_id_editable: data.affiliate_id_editable,
      avatar: data.avatar,
      social_accounts: data.social_accounts,
    };
  }

  // ADMIN
  if (roleId === 1) {
    return {
      name: data.name,
      email: data.email,
      affiliate: data.affiliate_id || "",
      avatar: data.avatar,
      social_accounts: null,
    };
  }

  return null;
};
