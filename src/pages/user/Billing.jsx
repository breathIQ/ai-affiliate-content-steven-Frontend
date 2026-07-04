import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout/Layout";
import toast from "react-hot-toast";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  getStripeConfig,
  getBalance,
  createSetupIntent,
  savePaymentMethod,
  purchaseCredits,
  updateAutoRecharge,
  getTransactions,
} from "../../services/billing.api";

const cardElementOptions = {
  style: {
    base: {
      fontSize: "14px",
      color: "#111827",
      "::placeholder": { color: "#9CA3AF" },
    },
  },
};

const transactionTypeStyles = {
  purchase: "bg-green-100 text-green-700",
  auto_recharge: "bg-green-100 text-green-700",
  deduction: "bg-gray-100 text-gray-700",
  refund: "bg-blue-100 text-blue-700",
};

function PaymentMethodCard({ hasPaymentMethod, onSaved }) {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSaving(true);
    try {
      const intentRes = await createSetupIntent();
      if (!intentRes?.success) {
        toast.error(intentRes?.message || "Could not start card setup");
        return;
      }

      const { error, setupIntent } = await stripe.confirmCardSetup(
        intentRes.data.client_secret,
        { payment_method: { card: elements.getElement(CardElement) } }
      );

      if (error) {
        toast.error(error.message || "Card could not be saved");
        return;
      }

      const saveRes = await savePaymentMethod(setupIntent.payment_method);
      if (!saveRes?.success) {
        toast.error(saveRes?.message || "Could not save payment method");
        return;
      }

      toast.success("Card saved successfully");
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong saving your card");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Payment Method</h2>
      <p className="text-sm text-gray-500 mb-4">
        {hasPaymentMethod
          ? "Update the card used for credit purchases and auto-recharge."
          : "Add a card to purchase credits and enable auto-recharge."}
      </p>
      <form onSubmit={handleSave}>
        <div className="border rounded-lg px-3 py-3">
          <CardElement options={cardElementOptions} />
        </div>
        <button
          type="submit"
          disabled={!stripe || saving}
          className="mt-4 bg-gray-900 text-white py-[10px] px-[16px] rounded-lg text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : hasPaymentMethod ? "Update Card" : "Save Card"}
        </button>
      </form>
    </div>
  );
}

function BillingContent() {
  const [balance, setBalanceData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [creditsToBuy, setCreditsToBuy] = useState(100);
  const [purchasing, setPurchasing] = useState(false);
  const [autoRechargeEnabled, setAutoRechargeEnabled] = useState(false);
  const [threshold, setThreshold] = useState(10);
  const [topupCredits, setTopupCredits] = useState(100);
  const [savingAutoRecharge, setSavingAutoRecharge] = useState(false);

  const loadBalance = async () => {
    try {
      const res = await getBalance();
      if (res?.success) {
        setBalanceData(res.data);
        setAutoRechargeEnabled(!!res.data.auto_recharge_enabled);
        setThreshold(res.data.auto_recharge_threshold || 10);
        setTopupCredits(res.data.auto_recharge_topup_credits || 100);
      }
    } catch (err) {
      console.error("GET BALANCE ERROR", err);
    }
  };

  const loadTransactions = async () => {
    try {
      const res = await getTransactions();
      if (res?.success) {
        setTransactions(res.data?.data || []);
      }
    } catch (err) {
      console.error("GET TRANSACTIONS ERROR", err);
    }
  };

  useEffect(() => {
    loadBalance();
    loadTransactions();
  }, []);

  const priceDollars = useMemo(() => {
    const cents = balance?.price_cents_per_credit || 0;
    return (cents / 100).toFixed(2);
  }, [balance]);

  const purchaseTotal = useMemo(() => {
    const cents = balance?.price_cents_per_credit || 0;
    return ((cents * (Number(creditsToBuy) || 0)) / 100).toFixed(2);
  }, [creditsToBuy, balance]);

  const handlePurchase = async () => {
    if (!balance?.has_payment_method) {
      toast.error("Add a card before purchasing credits");
      return;
    }

    setPurchasing(true);
    try {
      const res = await purchaseCredits(Number(creditsToBuy));
      if (!res?.success) {
        toast.error(res?.message || "Purchase failed");
        return;
      }
      toast.success(`Purchased ${creditsToBuy} credits`);
      loadBalance();
      loadTransactions();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  const handleAutoRechargeSave = async (enabled) => {
    setSavingAutoRecharge(true);
    try {
      const res = await updateAutoRecharge({
        enabled,
        threshold: Number(threshold),
        topupCredits: Number(topupCredits),
      });
      if (!res?.success) {
        toast.error(res?.message || "Could not update auto-recharge");
        return;
      }
      setAutoRechargeEnabled(enabled);
      toast.success("Auto-recharge settings updated");
      loadBalance();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update auto-recharge");
    } finally {
      setSavingAutoRecharge(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-6">
      {/* Balance */}
      <div className="bg-[#1B283F] rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-sm text-[#99A1B7] mb-1">Credit Balance</p>
          <h2 className="text-4xl font-bold">{balance?.credits_balance ?? "—"}</h2>
          <p className="text-sm text-[#99A1B7] mt-2">
            ${priceDollars}/credit · {balance?.has_payment_method ? "Card on file" : "No card on file"}
            {balance?.auto_recharge_enabled && " · Auto-recharge on"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PaymentMethodCard hasPaymentMethod={!!balance?.has_payment_method} onSaved={loadBalance} />

        {/* Purchase Credits */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Purchase Credits</h2>
          <p className="text-sm text-gray-500 mb-4">Top up your balance any time.</p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Credits</label>
              <input
                type="number"
                min={1}
                value={creditsToBuy}
                onChange={(e) => setCreditsToBuy(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="bg-[#F8285A] text-white py-[10px] px-[16px] rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {purchasing ? "Purchasing..." : `Buy for $${purchaseTotal}`}
            </button>
          </div>
        </div>
      </div>

      {/* Auto-recharge */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-gray-900">Auto-Recharge</h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoRechargeEnabled}
              onChange={(e) => handleAutoRechargeSave(e.target.checked)}
              disabled={savingAutoRecharge || !balance?.has_payment_method}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[#F8285A] transition-colors" />
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5" />
          </label>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {balance?.has_payment_method
            ? "Automatically top up your balance when it drops below your threshold."
            : "Add a card above to enable auto-recharge."}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Recharge when balance drops below</label>
            <input
              type="number"
              min={1}
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              onBlur={() => autoRechargeEnabled && handleAutoRechargeSave(true)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Top up amount (credits)</label>
            <input
              type="number"
              min={1}
              value={topupCredits}
              onChange={(e) => setTopupCredits(e.target.value)}
              onBlur={() => autoRechargeEnabled && handleAutoRechargeSave(true)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Credits</th>
                <th className="py-2 pr-4">Balance After</th>
                <th className="py-2 pr-4">Description</th>
                <th className="py-2 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-400">
                    No transactions yet.
                  </td>
                </tr>
              )}
              {transactions.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transactionTypeStyles[t.type] || "bg-gray-100 text-gray-700"}`}>
                      {t.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className={`py-2 pr-4 font-medium ${t.credits < 0 ? "text-red-600" : "text-green-600"}`}>
                    {t.credits > 0 ? `+${t.credits}` : t.credits}
                  </td>
                  <td className="py-2 pr-4">{t.balance_after}</td>
                  <td className="py-2 pr-4 text-gray-600">{t.description}</td>
                  <td className="py-2 pr-4 text-gray-400">
                    {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Billing() {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    getStripeConfig()
      .then((res) => {
        if (res?.publishable_key) {
          setStripePromise(loadStripe(res.publishable_key));
        }
      })
      .catch((err) => console.error("GET STRIPE CONFIG ERROR", err));
  }, []);

  // useStripe()/useElements() (used inside PaymentMethodCard) only degrade
  // to null gracefully while *inside* an <Elements> provider whose stripe
  // prop hasn't resolved yet - they throw "Could not find Elements context"
  // if there's no <Elements> ancestor at all. So the provider must always
  // be present; passing a null stripePromise (before the key loads, or
  // if none is configured) is the officially supported way to represent
  // "not ready yet" without blocking the rest of the page on it.
  return (
    <Layout>
      <Elements stripe={stripePromise}>
        <BillingContent />
      </Elements>
    </Layout>
  );
}
