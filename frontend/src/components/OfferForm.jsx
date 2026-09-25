import { useState } from "react";
import { postJson } from "../api/client";

export default function OfferForm({ products, regions, users, onCreated }) {
  const [form, setForm] = useState({
    product_id: "",
    region_id: "",
    seller_id: "",
    price: "5000",
    volume: "100",
    order_type: "ASK",
  });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    await postJson("/api/offers", {
      ...form,
      product_id: Number(form.product_id),
      region_id: Number(form.region_id),
      seller_id: Number(form.seller_id),
    });
    onCreated();
  }

  return (
    <div className="card">
      <h2>Новое намерение</h2>
      <form onSubmit={submit}>
        <select required value={form.product_id} onChange={(e) => update("product_id", e.target.value)}>
          <option value="">Product</option>
          {products.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select required value={form.region_id} onChange={(e) => update("region_id", e.target.value)}>
          <option value="">Region</option>
          {regions.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select required value={form.seller_id} onChange={(e) => update("seller_id", e.target.value)}>
          <option value="">User</option>
          {users.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select value={form.order_type} onChange={(e) => update("order_type", e.target.value)}>
          <option value="ASK">ASK — продать</option>
          <option value="BID">BID — купить</option>
        </select>
        <input type="number" min="1" value={form.price} onChange={(e) => update("price", e.target.value)} />
        <input type="number" min="1" value={form.volume} onChange={(e) => update("volume", e.target.value)} />
        <button type="submit">Опубликовать</button>
      </form>
    </div>
  );
}
