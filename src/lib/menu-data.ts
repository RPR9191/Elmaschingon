import { Category, Meat, Topping, Salsa, Extra } from "./types";

export const categories: Category[] = [
  { id: 1, name: "Tacos", icon: "taco", base_price: 3.0, sort_order: 1 },
  { id: 2, name: "Chorreadas", icon: "chorreada", base_price: 7.0, sort_order: 2 },
  { id: 3, name: "Vampiros", icon: "vampiro", base_price: 6.5, sort_order: 3 },
  { id: 4, name: "Gringas", icon: "gringa", base_price: 16.0, sort_order: 4 },
  { id: 5, name: "Burritos", icon: "burrito", base_price: 13.0, sort_order: 5 },
  { id: 6, name: "Quesadillas", icon: "quesadilla", base_price: 9.0, sort_order: 6 },
];

export const meats: Meat[] = [
  { id: 1, name: "Asada", description: "Carne de res asada a la parrilla" },
  { id: 2, name: "Pastor", description: "Cerdo marinado al estilo tradicional" },
  { id: 3, name: "Pollo", description: "Pollo sazonado y asado" },
  { id: 4, name: "Chorizo", description: "Chorizo artesanal" },
  { id: 5, name: "Cabeza", description: "Carne de res cocida lentamente" },
];

export const toppings: Topping[] = [
  { id: 1, name: "Cebolla", extra_price: 0 },
  { id: 2, name: "Cilantro", extra_price: 0 },
  { id: 3, name: "Lechuga", extra_price: 0 },
  { id: 4, name: "Jitomate", extra_price: 0 },
  { id: 5, name: "Frijoles", extra_price: 1.0 },
  { id: 6, name: "Arroz", extra_price: 1.0 },
  { id: 7, name: "Crema", extra_price: 0 },
  { id: 8, name: "Aguacate", extra_price: 1.5 },
];

export const salsas: Salsa[] = [
  { id: 1, name: "Roja", description: "Salsa de chile rojo tradicional" },
  { id: 2, name: "Verde", description: "Salsa de chile verde y tomatillo" },
  { id: 3, name: "Guacamole", description: "Guacamole fresco" },
  { id: 4, name: "Habanero", description: "Salsa picante de habanero" },
];

export const extras: Extra[] = [
  { id: 1, name: "Queso extra", price: 1.0 },
  { id: 2, name: "Mas carne", price: 3.0 },
  { id: 3, name: "Totopos", price: 2.0 },
];