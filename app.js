"use strict";

const SUPABASE_URL = "https://isdwonewpoqkzukjmvzo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_SYTUgtEIrfcqgw0iiWC0Og_SECS804C";

const foodItems = Object.freeze([
  {
    id: "classic-cheeseburger",
    name: "Classic Cheeseburger",
    category: "Bestseller",
    description:
      "Grilled beef, cheddar, crisp lettuce, tomato, and house sauce.",
    price: 149,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    category: "Italian",
    description: "Tomato, mozzarella, fresh basil, and extra virgin olive oil.",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "chicken-teriyaki",
    name: "Chicken Teriyaki",
    category: "Asian",
    description:
      "Glazed chicken with steamed rice, sesame, and garden vegetables.",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "creamy-carbonara",
    name: "Creamy Carbonara",
    category: "Pasta",
    description:
      "Silky cream sauce, smoked bacon, parmesan, and cracked pepper.",
    price: 179,
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "beef-tacos",
    name: "Beef Tacos",
    category: "Mexican",
    description: "Three soft tacos with seasoned beef, salsa, and fresh lime.",
    price: 169,
    image:
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "garden-salad",
    name: "Garden Salad",
    category: "Fresh",
    description:
      "Mixed greens, cucumber, tomatoes, avocado, and citrus dressing.",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
  },
]);

const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const menuGrid = document.querySelector("#menuGrid");
const orderForm = document.querySelector("#orderForm");
const customerNameInput = document.querySelector("#customerName");
const foodSelect = document.querySelector("#foodSelect");
const totalPrice = document.querySelector("#totalPrice");
const orderSummaryText = document.querySelector("#orderSummaryText");
const emptySelection = document.querySelector("#emptySelection");
const cartItemsContainer = document.querySelector("#cartItems");
const cartStatus = document.querySelector("#cartStatus");
const clearOrderButton = document.querySelector("#clearOrderButton");
const orderCount = document.querySelector("#orderCount");
const orderMessage = document.querySelector("#orderMessage");
const placeOrderButton = document.querySelector("#placeOrderButton");
const buttonLabel = placeOrderButton.querySelector(".button-label");
const buttonSpinner = placeOrderButton.querySelector(".button-spinner");
const buttonArrow = placeOrderButton.querySelector(".button-arrow");

const cart = new Map();

const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

function formatCurrency(amount) {
  return currencyFormatter.format(amount).replace("PHP", "₱");
}

function renderMenu() {
  menuGrid.innerHTML = foodItems
    .map(
      (food) => `
        <div class="col-sm-6">
          <button
            type="button"
            class="food-card"
            data-food-id="${food.id}"
            aria-pressed="false"
            aria-label="Add ${food.name} for ${formatCurrency(food.price)}"
          >
            <div class="food-image-wrap">
              <img
                class="food-image"
                src="${food.image}"
                alt="${food.name}"
                loading="lazy"
              >
              <span class="food-category">${food.category}</span>
              <span class="select-indicator" aria-hidden="true">
                <i class="bi bi-check-lg"></i>
              </span>
            </div>
            <div class="food-card-body">
              <h3>${food.name}</h3>
              <p>${food.description}</p>
              <div class="food-card-footer">
                <span class="food-price">${formatCurrency(food.price)}</span>
                <span class="choose-label">Add <i class="bi bi-plus-lg"></i></span>
              </div>
            </div>
          </button>
        </div>
      `,
    )
    .join("");

  foodItems.forEach((food) => {
    const option = document.createElement("option");
    option.value = food.id;
    option.textContent = `${food.name} - ${formatCurrency(food.price)}`;
    foodSelect.append(option);
  });
}

function getCartItems() {
  return Array.from(cart.values());
}

function getItemCount() {
  return getCartItems().reduce((count, item) => count + item.quantity, 0);
}

function getOrderTotal() {
  return getCartItems().reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
}

function renderCartItems() {
  cartItemsContainer.innerHTML = getCartItems()
    .map(
      (item) => `
        <article class="cart-item" data-cart-food-id="${item.id}">
          <img src="${item.image}" alt="" loading="lazy">
          <div class="cart-item-content">
            <div class="cart-item-heading">
              <strong>${item.name}</strong>
              <button
                type="button"
                class="remove-item-button"
                data-cart-action="remove"
                aria-label="Remove ${item.name} from order"
                title="Remove ${item.name}"
              >
                <i class="bi bi-x-lg" aria-hidden="true"></i>
              </button>
            </div>
            <span class="cart-item-price">
              Price: <strong>${formatCurrency(item.price)}</strong> each
            </span>
            <div class="cart-item-actions">
              <div>
                <label for="quantity-${item.id}">Quantity</label>
                <div class="quantity-control quantity-control-compact">
                  <button
                    type="button"
                    class="quantity-button"
                    data-cart-action="decrease"
                    aria-label="Decrease ${item.name} quantity"
                  >
                    <i class="bi bi-dash-lg" aria-hidden="true"></i>
                  </button>
                  <input
                    type="number"
                    id="quantity-${item.id}"
                    min="1"
                    max="20"
                    value="${item.quantity}"
                    data-cart-quantity
                    aria-label="Quantity for ${item.name}"
                    required
                  >
                  <button
                    type="button"
                    class="quantity-button"
                    data-cart-action="increase"
                    aria-label="Increase ${item.name} quantity"
                  >
                    <i class="bi bi-plus-lg" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
              <strong class="cart-line-total">
                ${formatCurrency(item.price * item.quantity)}
              </strong>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function updateOrderDetails() {
  const cartItems = getCartItems();
  const itemCount = getItemCount();

  document.querySelectorAll(".food-card").forEach((card) => {
    const food = foodItems.find((item) => item.id === card.dataset.foodId);
    const isSelected = cart.has(card.dataset.foodId);
    const chooseLabel = card.querySelector(".choose-label");

    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
    card.setAttribute(
      "aria-label",
      `${isSelected ? "Remove" : "Add"} ${food.name} ${isSelected ? "from" : "to"} order`,
    );
    chooseLabel.innerHTML = isSelected
      ? 'Added <i class="bi bi-check-lg"></i>'
      : 'Add <i class="bi bi-plus-lg"></i>';
  });

  Array.from(foodSelect.options).forEach((option) => {
    if (option.value) {
      option.disabled = cart.has(option.value);
    }
  });

  foodSelect.value = "";
  foodSelect.setCustomValidity(
    cartItems.length > 0 ? "" : "Please choose at least one food item.",
  );
  renderCartItems();
  emptySelection.classList.toggle("d-none", cartItems.length > 0);
  cartItemsContainer.classList.toggle("d-none", cartItems.length === 0);
  clearOrderButton.classList.toggle("d-none", cartItems.length === 0);
  totalPrice.textContent = formatCurrency(getOrderTotal());
  orderSummaryText.textContent = `${cartItems.length} ${cartItems.length === 1 ? "dish" : "dishes"} · ${itemCount} ${itemCount === 1 ? "item" : "items"}`;
  orderCount.textContent = String(itemCount);
  cartStatus.textContent =
    cartItems.length === 0
      ? "Your order is empty."
      : `${cartItems.length} ${cartItems.length === 1 ? "dish" : "dishes"} selected, ${itemCount} ${itemCount === 1 ? "item" : "items"} total.`;
}

function addFood(foodId) {
  const food = foodItems.find((item) => item.id === foodId);
  if (!food || cart.has(foodId)) {
    return;
  }

  cart.set(foodId, { ...food, quantity: 1 });
  hideMessage();
  updateOrderDetails();
}

function toggleFood(foodId) {
  if (cart.has(foodId)) {
    cart.delete(foodId);
  } else {
    const food = foodItems.find((item) => item.id === foodId);
    if (food) {
      cart.set(foodId, { ...food, quantity: 1 });
    }
  }

  hideMessage();
  updateOrderDetails();
}

function adjustQuantity(foodId, change) {
  const item = cart.get(foodId);
  if (!item) {
    return;
  }

  item.quantity = Math.min(20, Math.max(1, item.quantity + change));
  hideMessage();
  updateOrderDetails();
}

function setQuantity(foodId, value) {
  const item = cart.get(foodId);
  if (!item) {
    return;
  }

  const quantity = Number.parseInt(value, 10);
  item.quantity = Math.min(
    20,
    Math.max(1, Number.isInteger(quantity) ? quantity : 1),
  );
  hideMessage();
  updateOrderDetails();
}

function showMessage(type, message) {
  orderMessage.className = `alert alert-${type}`;
  orderMessage.textContent = message;
}

function hideMessage() {
  orderMessage.className = "d-none";
  orderMessage.textContent = "";
}

function setSubmitting(isSubmitting) {
  placeOrderButton.disabled = isSubmitting;
  buttonLabel.textContent = isSubmitting ? "Placing Order" : "Place Order";
  buttonSpinner.classList.toggle("d-none", !isSubmitting);
  buttonArrow.classList.toggle("d-none", isSubmitting);
}

function validateForm() {
  const trimmedName = customerNameInput.value.trim();
  customerNameInput.value = trimmedName;
  customerNameInput.setCustomValidity(
    trimmedName.length >= 2 ? "" : "Please enter at least 2 characters.",
  );
  foodSelect.setCustomValidity(
    cart.size > 0 ? "" : "Please choose at least one food item.",
  );

  getCartItems().forEach((item) => {
    const quantityInput = cartItemsContainer.querySelector(
      `#quantity-${item.id}`,
    );
    quantityInput?.setCustomValidity(
      item.quantity >= 1 && item.quantity <= 20
        ? ""
        : "Choose a quantity from 1 to 20.",
    );
  });

  orderForm.classList.add("was-validated");
  return orderForm.checkValidity();
}

function resetOrder() {
  orderForm.reset();
  orderForm.classList.remove("was-validated");
  customerNameInput.setCustomValidity("");
  cart.clear();
  updateOrderDetails();
}

async function placeOrder(event) {
  event.preventDefault();
  hideMessage();

  if (!validateForm()) {
    orderForm.querySelector(":invalid")?.focus();
    return;
  }

  if (!supabaseClient) {
    showMessage(
      "danger",
      "The ordering service could not load. Check your connection and try again.",
    );
    return;
  }

  const orders = getCartItems().map((item) => ({
    customer_name: customerNameInput.value,
    food_name: item.name,
    unit_price: item.price,
    quantity: item.quantity,
  }));

  setSubmitting(true);

  try {
    const { error } = await supabaseClient.from("orders").insert(orders);

    if (error) {
      throw error;
    }

    resetOrder();
    showMessage("success", "Order successfully placed!");
  } catch (error) {
    console.error("Unable to place order:", error);

    const setupMessage =
      error?.code === "PGRST205"
        ? "The orders table is not ready. Import supabase.sql, then try again."
        : "We couldn't place your order. Please try again.";

    showMessage("danger", setupMessage);
  } finally {
    setSubmitting(false);
  }
}

renderMenu();
updateOrderDetails();
document.querySelector("#currentYear").textContent = new Date().getFullYear();

menuGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".food-card");
  if (card) {
    toggleFood(card.dataset.foodId);
  }
});

foodSelect.addEventListener("change", () => addFood(foodSelect.value));
cartItemsContainer.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-cart-action]");
  const cartItem = event.target.closest("[data-cart-food-id]");

  if (!actionButton || !cartItem) {
    return;
  }

  const foodId = cartItem.dataset.cartFoodId;
  const action = actionButton.dataset.cartAction;

  if (action === "remove") {
    cart.delete(foodId);
    hideMessage();
    updateOrderDetails();
  } else {
    adjustQuantity(foodId, action === "increase" ? 1 : -1);
  }
});
cartItemsContainer.addEventListener("change", (event) => {
  if (event.target.matches("[data-cart-quantity]")) {
    const cartItem = event.target.closest("[data-cart-food-id]");
    setQuantity(cartItem.dataset.cartFoodId, event.target.value);
  }
});
clearOrderButton.addEventListener("click", () => {
  cart.clear();
  hideMessage();
  updateOrderDetails();
});
customerNameInput.addEventListener("input", () => {
  customerNameInput.setCustomValidity("");
  hideMessage();
});
orderForm.addEventListener("submit", placeOrder);
