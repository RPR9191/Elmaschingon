"use client";

import React, { useState, useCallback } from "react";
import Header from "@/components/Header";
import CartBar from "@/components/CartBar";
import OrderModal from "@/components/OrderModal";
import { CategoryIcon, MeatIcon } from "@/lib/icons";
import { categories, meats, toppings, salsas, extras } from "@/lib/menu-data";
import { Category, Meat, Topping, Salsa, Extra, CartItem } from "@/lib/types";

type Step = "category" | "meat" | "toppings" | "salsa" | "extras" | "confirm";

export default function Home() {
  const [step, setStep] = useState<Step>("category");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedMeat, setSelectedMeat] = useState<Meat | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [selectedSalsa, setSelectedSalsa] = useState<Salsa | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const calculateUnitPrice = useCallback(() => {
    let price = selectedCategory?.base_price || 0;
    selectedToppings.forEach((t) => (price += t.extra_price));
    selectedExtras.forEach((e) => (price += e.price));
    return price;
  }, [selectedCategory, selectedToppings, selectedExtras]);

  const addToCart = () => {
    if (!selectedCategory) return;
    const unitPrice = calculateUnitPrice();
    const item: CartItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: selectedCategory,
      meat: selectedMeat,
      toppings: selectedToppings,
      salsa: selectedSalsa,
      extras: selectedExtras,
      quantity,
      unit_price: unitPrice,
      total_price: unitPrice * quantity,
    };
    setCart((prev) => [...prev, item]);
    // Reset selections
    setSelectedMeat(null);
    setSelectedToppings([]);
    setSelectedSalsa(null);
    setSelectedExtras([]);
    setQuantity(1);
    setStep("category");
  };

  const removeCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleTopping = (topping: Topping) => {
    setSelectedToppings((prev) =>
      prev.find((t) => t.id === topping.id)
        ? prev.filter((t) => t.id !== topping.id)
        : [...prev, topping]
    );
  };

  const toggleExtra = (extra: Extra) => {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const getTotal = () => cart.reduce((sum, item) => sum + item.total_price, 0);

  const getWhatsAppMessage = () => {
    let msg = "Hola Tacos Sinaloa! Quiero hacer un pedido:\n\n";
    cart.forEach((item, i) => {
      msg += `${i + 1}. ${item.quantity}x ${item.category.name}`;
      if (item.meat) msg += ` (${item.meat.name})`;
      msg += ` - $${item.total_price.toFixed(2)}\n`;
      if (item.toppings.length > 0) msg += `    Toppings: ${item.toppings.map((t) => t.name).join(", ")}\n`;
      if (item.salsa) msg += `    Salsa: ${item.salsa.name}\n`;
      if (item.extras.length > 0) msg += `    Extras: ${item.extras.map((e) => e.name).join(", ")}\n`;
    });
    msg += `\nTotal: $${getTotal().toFixed(2)}`;
    if (customerName) msg += `\nCliente: ${customerName}`;
    if (customerPhone) msg += `\nTel: ${customerPhone}`;
    return encodeURIComponent(msg);
  };

  const sendWhatsApp = () => {
    const url = `https://wa.me/13233032084?text=${getWhatsAppMessage()}`;
    window.open(url, "_blank");
  };

  const saveOrder = async () => {
    if (!customerName.trim()) return;
    setSaving(true);
    try {
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        items: cart.map((item) => ({
          category_name: item.category.name,
          meat_name: item.meat?.name || null,
          toppings: item.toppings.map((t) => t.name),
          salsa_name: item.salsa?.name || null,
          extras: item.extras.map((e) => e.name),
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        })),
        total: getTotal(),
        notes: "",
        payment_method: "efectivo",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setCart([]);
        setShowModal(false);
        alert("Pedido guardado exitosamente!");
      } else {
        const data = await res.json();
        alert("Error al guardar: " + (data.error || "Desconocido"));
      }
    } catch (err) {
      alert("Error de conexion. Verifica que Supabase este configurado.");
    } finally {
      setSaving(false);
    }
  };

  const stepTitle = (s: Step): string => {
    const titles: Record<Step, string> = {
      category: "Que se te antoja?",
      meat: "Elige tu carne",
      toppings: "Agrega toppings",
      salsa: "Elige tu salsa",
      extras: "Extras (opcional)",
      confirm: "Confirmar item",
    };
    return titles[s];
  };

  // Step indicators
  const stepNumbers: Step[] = ["category", "meat", "toppings", "salsa", "extras", "confirm"];
  const currentStepIndex = stepNumbers.indexOf(step);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-1.5 text-xs">
          {stepNumbers.map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  i <= currentStepIndex
                    ? "bg-gold text-background"
                    : "bg-dark-card text-foreground/30"
                }`}
              >
                {i + 1}
              </div>
              {i < stepNumbers.length - 1 && (
                <div
                  className={`h-px w-6 transition-colors ${
                    i < currentStepIndex ? "bg-gold" : "bg-dark-border"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-foreground">{stepTitle(step)}</h2>
          {selectedCategory && (
            <p className="mt-1 text-sm text-gold">{selectedCategory.name} (base ${selectedCategory.base_price.toFixed(2)})</p>
          )}
        </div>

        {/* Step 1: Category */}
        {step === "category" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setStep("meat");
                }}
                className="group flex flex-col items-center gap-3 rounded-xl border border-dark-border bg-dark-card p-5 transition-all hover:border-gold/30 hover:bg-dark-hover"
              >
                <div className="text-gold/70 transition-colors group-hover:text-gold">
                  <CategoryIcon name={cat.icon} className="h-10 w-10" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">{cat.name}</p>
                  <p className="text-sm text-gold">${cat.base_price.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Meat */}
        {step === "meat" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {meats.map((meat) => (
              <button
                key={meat.id}
                onClick={() => {
                  setSelectedMeat(meat);
                  setStep("toppings");
                }}
                className={`group flex flex-col items-center gap-3 rounded-xl border p-5 transition-all ${
                  selectedMeat?.id === meat.id
                    ? "border-gold bg-gold/5"
                    : "border-dark-border bg-dark-card hover:border-gold/30 hover:bg-dark-hover"
                }`}
              >
                <div className={`transition-colors ${
                  selectedMeat?.id === meat.id ? "text-gold" : "text-foreground/50 group-hover:text-gold"
                }`}>
                  <MeatIcon name={meat.name} className="h-10 w-10" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">{meat.name}</p>
                  <p className="text-xs text-foreground/50">{meat.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Toppings */}
        {step === "toppings" && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {toppings.map((topping) => {
                const isSelected = selectedToppings.some((t) => t.id === topping.id);
                return (
                  <button
                    key={topping.id}
                    onClick={() => toggleTopping(topping)}
                    className={`rounded-xl border p-4 text-center transition-all ${
                      isSelected
                        ? "border-gold bg-gold/5"
                        : "border-dark-border bg-dark-card hover:border-gold/30 hover:bg-dark-hover"
                    }`}
                  >
                    <div className={`text-lg ${isSelected ? "text-gold" : "text-foreground/70"}`}>
                      {isSelected ? (
                        <svg className="mx-auto h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg className="mx-auto h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{topping.name}</p>
                    {topping.extra_price > 0 && (
                      <p className="text-xs text-gold">+${topping.extra_price.toFixed(2)}</p>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setStep("salsa")}
                className="rounded-lg bg-gold px-8 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-gold-dark"
              >
                Siguiente
              </button>
            </div>
          </>
        )}

        {/* Step 4: Salsa */}
        {step === "salsa" && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {salsas.map((salsa) => (
              <button
                key={salsa.id}
                onClick={() => {
                  setSelectedSalsa(salsa);
                  setStep("extras");
                }}
                className={`rounded-xl border p-5 text-center transition-all ${
                  selectedSalsa?.id === salsa.id
                    ? "border-gold bg-gold/5"
                    : "border-dark-border bg-dark-card hover:border-gold/30 hover:bg-dark-hover"
                }`}
              >
                <svg className={`mx-auto h-8 w-8 ${selectedSalsa?.id === salsa.id ? "text-gold" : "text-foreground/50"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                </svg>
                <p className="mt-2 font-semibold text-foreground">{salsa.name}</p>
                <p className="text-xs text-foreground/50">{salsa.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step 5: Extras */}
        {step === "extras" && (
          <>
            <p className="mb-4 text-center text-sm text-foreground/50">
              Selecciona extras opcionales
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {extras.map((extra) => {
                const isSelected = selectedExtras.some((e) => e.id === extra.id);
                return (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra)}
                    className={`rounded-xl border p-4 text-center transition-all ${
                      isSelected
                        ? "border-gold bg-gold/5"
                        : "border-dark-border bg-dark-card hover:border-gold/30 hover:bg-dark-hover"
                    }`}
                  >
                    <div className={`text-lg ${isSelected ? "text-gold" : "text-foreground/70"}`}>
                      {isSelected ? (
                        <svg className="mx-auto h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg className="mx-auto h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium text-foreground">{extra.name}</p>
                    <p className="text-xs text-gold">+${extra.price.toFixed(2)}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setStep("salsa")}
                className="rounded-lg border border-dark-border px-6 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-dark-hover"
              >
                Atras
              </button>
              <button
                onClick={() => setStep("confirm")}
                className="rounded-lg bg-gold px-8 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-gold-dark"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {/* Step 6: Confirm */}
        {step === "confirm" && (
          <div className="mx-auto max-w-md space-y-4">
            <div className="rounded-xl border border-dark-border bg-dark-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/50">Tipo</span>
                <span className="font-semibold text-foreground">{selectedCategory?.name}</span>
              </div>
              {selectedMeat && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/50">Carne</span>
                  <span className="text-foreground">{selectedMeat.name}</span>
                </div>
              )}
              {selectedToppings.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/50">Toppings</span>
                  <span className="text-right text-foreground">
                    {selectedToppings.map((t) => t.name).join(", ")}
                  </span>
                </div>
              )}
              {selectedSalsa && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/50">Salsa</span>
                  <span className="text-foreground">{selectedSalsa.name}</span>
                </div>
              )}
              {selectedExtras.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/50">Extras</span>
                  <span className="text-right text-foreground">
                    {selectedExtras.map((e) => e.name).join(", ")}
                  </span>
                </div>
              )}
              <div className="border-t border-dark-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/50">Precio unitario</span>
                  <span className="text-gold">${calculateUnitPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-dark-border text-foreground transition-colors hover:bg-dark-hover"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <span className="min-w-[3rem] text-center text-2xl font-bold text-foreground">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(20, quantity + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-dark-border text-foreground transition-colors hover:bg-dark-hover"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-center">
              <p className="text-sm text-foreground/50">Total para este item</p>
              <p className="text-2xl font-bold text-gold">
                ${(calculateUnitPrice() * quantity).toFixed(2)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("extras")}
                className="flex-1 rounded-lg border border-dark-border px-4 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-dark-hover"
              >
                Atras
              </button>
              <button
                onClick={addToCart}
                className="flex-1 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-gold-dark"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        )}

        {/* Back button for steps other than category */}
        {step !== "category" && step !== "confirm" && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                const prevStep: Record<Step, Step> = {
                  category: "category",
                  meat: "category",
                  toppings: "meat",
                  salsa: "toppings",
                  extras: "salsa",
                  confirm: "extras",
                };
                setStep(prevStep[step]);
              }}
              className="text-sm text-foreground/50 transition-colors hover:text-gold"
            >
              Atras
            </button>
          </div>
        )}
      </main>

      {/* Cart bar */}
      <CartBar
        itemCount={cart.length}
        total={getTotal()}
        onReview={() => setShowModal(true)}
      />

      {/* Order modal */}
      {showModal && (
        <OrderModal
          items={cart}
          customerName={customerName}
          customerPhone={customerPhone}
          onCustomerNameChange={setCustomerName}
          onCustomerPhoneChange={setCustomerPhone}
          onClose={() => setShowModal(false)}
          onRemoveItem={removeCartItem}
          onSendWhatsApp={sendWhatsApp}
          onSaveOrder={saveOrder}
          saving={saving}
        />
      )}
    </div>
  );
}