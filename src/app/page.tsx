"use client";

import React, { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import CartBar from "@/components/CartBar";
import OrderModal from "@/components/OrderModal";
import { CategoryIcon, MeatIcon } from "@/lib/icons";
import { Category, Meat, Topping, Salsa, Extra, CartItem } from "@/lib/types";

// Fallback data for when the API is unavailable
const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, name: "Tacos", icon: "taco", base_price: 3.0, sort_order: 1 },
  { id: 2, name: "Chorreadas", icon: "chorreada", base_price: 7.0, sort_order: 2 },
  { id: 3, name: "Vampiros", icon: "vampiro", base_price: 6.5, sort_order: 3 },
  { id: 4, name: "Gringas", icon: "gringa", base_price: 16.0, sort_order: 4 },
  { id: 5, name: "Burritos", icon: "burrito", base_price: 13.0, sort_order: 5 },
  { id: 6, name: "Quesadillas", icon: "quesadilla", base_price: 9.0, sort_order: 6 },
];

const FALLBACK_MEATS: Meat[] = [
  { id: 1, name: "Asada", description: "Carne de res asada a la parrilla" },
  { id: 2, name: "Pastor", description: "Cerdo marinado al estilo tradicional" },
  { id: 3, name: "Pollo", description: "Pollo sazonado y asado" },
  { id: 4, name: "Chorizo", description: "Chorizo artesanal" },
  { id: 5, name: "Cabeza", description: "Carne de res cocida lentamente" },
];

const FALLBACK_TOPPINGS: Topping[] = [
  { id: 1, name: "Cebolla", extra_price: 0 },
  { id: 2, name: "Cilantro", extra_price: 0 },
  { id: 3, name: "Lechuga", extra_price: 0 },
  { id: 4, name: "Jitomate", extra_price: 0 },
  { id: 5, name: "Frijoles", extra_price: 1.0 },
  { id: 6, name: "Arroz", extra_price: 1.0 },
  { id: 7, name: "Crema", extra_price: 0 },
  { id: 8, name: "Aguacate", extra_price: 1.5 },
];

const FALLBACK_SALSAS: Salsa[] = [
  { id: 1, name: "Roja", description: "Salsa de chile rojo tradicional" },
  { id: 2, name: "Verde", description: "Salsa de chile verde y tomatillo" },
  { id: 3, name: "Guacamole", description: "Guacamole fresco" },
  { id: 4, name: "Habanero", description: "Salsa picante de habanero" },
];

const FALLBACK_EXTRAS: Extra[] = [
  { id: 1, name: "Queso extra", price: 1.0 },
  { id: 2, name: "Mas carne", price: 3.0 },
  { id: 3, name: "Totopos", price: 2.0 },
];

type Step = "category" | "meat" | "toppings" | "salsa" | "extras" | "confirm";

const STEP_LABELS: Record<Step, string> = {
  category: "Categoría",
  meat: "Carne",
  toppings: "Toppings",
  salsa: "Salsa",
  extras: "Extras",
  confirm: "Confirmar",
};

/** Fade wrapper: renders children with a fade-in effect keyed on the step */
function FadeStep({ step, children }: { step: Step; children: React.ReactNode }) {
  return (
    <div key={step}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        className="motion-safe:animate-[fadeIn_0.3s_ease-out]"
      >
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [menuData, setMenuData] = useState<{
    categories: Category[];
    meats: Meat[];
    toppings: Topping[];
    salsas: Salsa[];
    extras: Extra[];
  } | null>(null);
  const [menuLoading, setMenuLoading] = useState(true);

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

  // Fetch menu from API
  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch("/api/menu/admin");
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        setMenuData({
          categories: data.categories ?? FALLBACK_CATEGORIES,
          meats: data.meats ?? FALLBACK_MEATS,
          toppings: data.toppings ?? FALLBACK_TOPPINGS,
          salsas: data.salsas ?? FALLBACK_SALSAS,
          extras: data.extras ?? FALLBACK_EXTRAS,
        });
      } catch {
        // Use fallback on error
        setMenuData({
          categories: FALLBACK_CATEGORIES,
          meats: FALLBACK_MEATS,
          toppings: FALLBACK_TOPPINGS,
          salsas: FALLBACK_SALSAS,
          extras: FALLBACK_EXTRAS,
        });
      } finally {
        setMenuLoading(false);
      }
    }
    loadMenu();
  }, []);

  const categories = menuData?.categories ?? FALLBACK_CATEGORIES;
  const meats = menuData?.meats ?? FALLBACK_MEATS;
  const toppings = menuData?.toppings ?? FALLBACK_TOPPINGS;
  const salsas = menuData?.salsas ?? FALLBACK_SALSAS;
  const extras = menuData?.extras ?? FALLBACK_EXTRAS;

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
    // Build order payload
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

    // Best-effort: try to save via API (may fail on Vercel without Supabase)
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // Silently ignore — WhatsApp is the primary delivery channel
    }

    // Always open WhatsApp regardless of API result
    sendWhatsApp();

    // Clear state
    setCart([]);
    setShowModal(false);
    setSaving(false);
  };

  const stepTitle = (s: Step): string => {
    const titles: Record<Step, string> = {
      category: "¿Qué se te antoja?",
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

  if (menuLoading) {
    return (
      <div
        className="flex min-h-screen flex-col bg-background"
        style={{
          backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201, 150, 51, 0.06) 0%, transparent 70%)",
        }}
      >
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-8 w-8 animate-spin text-gold" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="mt-3 text-sm text-foreground/50">Cargando menú...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-background pb-28"
      style={{
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201, 150, 51, 0.06) 0%, transparent 70%)",
      }}
    >
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5">
        {/* Step indicator - visual dots with labels */}
        <div className="mb-6 flex items-center justify-center gap-0">
          {stepNumbers.map((s, i) => (
            <React.Fragment key={s}>
              {/* Dot */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`rounded-full transition-all duration-300 ${
                    i === currentStepIndex
                      ? "h-3.5 w-3.5 bg-gold shadow-[0_0_8px_rgba(201,150,51,0.5)]"
                      : i < currentStepIndex
                      ? "h-2.5 w-2.5 bg-gold/60"
                      : "h-2.5 w-2.5 bg-dark-border"
                  }`}
                />
                <span
                  className={`text-[10px] leading-tight transition-colors duration-300 ${
                    i <= currentStepIndex ? "text-gold/80" : "text-foreground/25"
                  }`}
                >
                  {STEP_LABELS[s]}
                </span>
              </div>
              {/* Connector line */}
              {i < stepNumbers.length - 1 && (
                <div
                  className={`mx-1.5 sm:mx-2.5 h-px transition-colors duration-300 ${
                    i < currentStepIndex ? "bg-gold/40" : "bg-dark-border"
                  }`}
                  style={{ width: "clamp(12px, 4vw, 28px)" }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step title */}
        <div className="mb-5 text-center">
          <h2
            className="text-xl font-bold text-foreground sm:text-2xl"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {stepTitle(step)}
          </h2>
          {selectedCategory && (
            <p className="mt-1.5 text-sm text-gold/80">
              {selectedCategory.name} · base ${selectedCategory.base_price.toFixed(2)}
            </p>
          )}
        </div>

        {/* Step 1: Category */}
        {step === "category" && (
          <FadeStep step={step}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setStep("meat");
                  }}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-dark-border/60 bg-dark-card/80 p-5 transition-all duration-200 hover:border-gold/30 hover:bg-dark-hover hover:shadow-lg hover:shadow-gold/5 active:scale-[0.97]"
                >
                  <div className="text-gold/60 transition-all duration-200 group-hover:text-gold group-hover:scale-110">
                    <CategoryIcon name={cat.icon} className="h-12 w-12 sm:h-14 sm:w-14" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-foreground sm:text-lg">{cat.name}</p>
                    <p className="mt-0.5 text-sm font-medium text-gold/80">
                      ${cat.base_price.toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </FadeStep>
        )}

        {/* Step 2: Meat */}
        {step === "meat" && (
          <FadeStep step={step}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {meats.map((meat) => (
                <button
                  key={meat.id}
                  onClick={() => {
                    setSelectedMeat(meat);
                    setStep("toppings");
                  }}
                  className={`group flex flex-col items-center gap-3 rounded-2xl border p-5 transition-all duration-200 active:scale-[0.97] ${
                    selectedMeat?.id === meat.id
                      ? "border-gold/60 bg-gold/5 shadow-md shadow-gold/10"
                      : "border-dark-border/60 bg-dark-card/80 hover:border-gold/30 hover:bg-dark-hover hover:shadow-lg hover:shadow-gold/5"
                  }`}
                >
                  <div
                    className={`transition-all duration-200 group-hover:scale-110 ${
                      selectedMeat?.id === meat.id
                        ? "text-gold"
                        : "text-foreground/50 group-hover:text-gold"
                    }`}
                  >
                    <MeatIcon name={meat.name} className="h-11 w-11 sm:h-13 sm:w-13" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-foreground">{meat.name}</p>
                    <p className="mt-0.5 text-xs text-foreground/50">{meat.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </FadeStep>
        )}

        {/* Step 3: Toppings */}
        {step === "toppings" && (
          <FadeStep step={step}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {toppings.map((topping) => {
                const isSelected = selectedToppings.some((t) => t.id === topping.id);
                return (
                  <button
                    key={topping.id}
                    onClick={() => toggleTopping(topping)}
                    className={`rounded-2xl border p-4 text-center transition-all duration-200 active:scale-[0.97] ${
                      isSelected
                        ? "border-gold/60 bg-gold/5 shadow-sm shadow-gold/10"
                        : "border-dark-border/60 bg-dark-card/80 hover:border-gold/30 hover:bg-dark-hover"
                    }`}
                  >
                    <div className={`text-lg ${isSelected ? "text-gold" : "text-foreground/60"}`}>
                      {isSelected ? (
                        <svg
                          className="mx-auto h-7 w-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg
                          className="mx-auto h-7 w-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-foreground">{topping.name}</p>
                    {topping.extra_price > 0 && (
                      <p className="mt-0.5 text-xs text-gold/80">+${topping.extra_price.toFixed(2)}</p>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setStep("salsa")}
                className="rounded-xl bg-gold px-10 py-3 text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-gold-dark hover:shadow-gold/30 active:scale-95"
              >
                Siguiente
              </button>
            </div>
          </FadeStep>
        )}

        {/* Step 4: Salsa */}
        {step === "salsa" && (
          <FadeStep step={step}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {salsas.map((salsa) => (
                <button
                  key={salsa.id}
                  onClick={() => {
                    setSelectedSalsa(salsa);
                    setStep("extras");
                  }}
                  className={`rounded-2xl border p-5 text-center transition-all duration-200 active:scale-[0.97] ${
                    selectedSalsa?.id === salsa.id
                      ? "border-gold/60 bg-gold/5 shadow-sm shadow-gold/10"
                      : "border-dark-border/60 bg-dark-card/80 hover:border-gold/30 hover:bg-dark-hover"
                  }`}
                >
                  <svg
                    className={`mx-auto h-9 w-9 transition-all duration-200 ${
                      selectedSalsa?.id === salsa.id ? "text-gold scale-110" : "text-foreground/40"
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  </svg>
                  <p className="mt-2 font-semibold text-foreground">{salsa.name}</p>
                  <p className="mt-0.5 text-xs text-foreground/50">{salsa.description}</p>
                </button>
              ))}
            </div>
          </FadeStep>
        )}

        {/* Step 5: Extras */}
        {step === "extras" && (
          <FadeStep step={step}>
            <p className="mb-4 text-center text-sm text-foreground/40">
              Selecciona extras opcionales
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {extras.map((extra) => {
                const isSelected = selectedExtras.some((e) => e.id === extra.id);
                return (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra)}
                    className={`rounded-2xl border p-4 text-center transition-all duration-200 active:scale-[0.97] ${
                      isSelected
                        ? "border-gold/60 bg-gold/5 shadow-sm shadow-gold/10"
                        : "border-dark-border/60 bg-dark-card/80 hover:border-gold/30 hover:bg-dark-hover"
                    }`}
                  >
                    <div className={`text-lg ${isSelected ? "text-gold" : "text-foreground/60"}`}>
                      {isSelected ? (
                        <svg
                          className="mx-auto h-7 w-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg
                          className="mx-auto h-7 w-7"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-foreground">{extra.name}</p>
                    <p className="mt-0.5 text-xs text-gold/80">+${extra.price.toFixed(2)}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setStep("salsa")}
                className="rounded-xl border border-dark-border/60 px-6 py-3 text-sm font-medium text-foreground/60 transition-all duration-200 hover:bg-dark-hover hover:text-foreground active:scale-95"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep("confirm")}
                className="rounded-xl bg-gold px-10 py-3 text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-gold-dark hover:shadow-gold/30 active:scale-95"
              >
                Continuar
              </button>
            </div>
          </FadeStep>
        )}

        {/* Step 6: Confirm */}
        {step === "confirm" && (
          <FadeStep step={step}>
            <div className="mx-auto max-w-md space-y-5">
              <div className="rounded-2xl border border-dark-border/50 bg-dark-card/80 p-5 space-y-3">
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
                <div className="border-t border-dark-border/40 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground/50">Precio unitario</span>
                    <span className="text-gold font-medium">${calculateUnitPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Quantity selector - circular buttons with gold border */}
              <div className="flex items-center justify-center gap-5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-gold transition-all duration-200 hover:bg-gold/5 hover:border-gold/60 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <span className="min-w-[3rem] text-center text-2xl font-bold text-foreground">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(20, quantity + 1))}
                  disabled={quantity >= 20}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-gold transition-all duration-200 hover:bg-gold/5 hover:border-gold/60 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 disabled:active:scale-100"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              <div className="rounded-2xl border border-gold/15 bg-gold/[0.03] p-4 text-center">
                <p className="text-sm text-foreground/50">Total para este item</p>
                <p className="text-2xl font-bold text-gold">
                  ${(calculateUnitPrice() * quantity).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep("extras")}
                  className="flex-1 rounded-xl border border-dark-border/60 px-4 py-3 text-sm font-medium text-foreground/60 transition-all duration-200 hover:bg-dark-hover hover:text-foreground active:scale-[0.98]"
                >
                  Atrás
                </button>
                <button
                  onClick={addToCart}
                  className="flex-1 rounded-xl bg-gold px-4 py-3 text-sm font-semibold text-background shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-gold-dark hover:shadow-gold/30 active:scale-[0.98]"
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </FadeStep>
        )}

        {/* Back button for steps other than category and confirm */}
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
              className="text-sm text-foreground/40 transition-all duration-200 hover:text-gold active:scale-95"
            >
              ← Atrás
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