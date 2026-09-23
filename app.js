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
const priceInput = document.querySelector("#priceInput");
const quantityInput = document.querySelector("#quantityInput");
const decreaseQuantityButton = document.querySelector("#decreaseQuantity");
const increaseQuantityButton = document.querySelector("#increaseQuantity");
const totalPrice = document.querySelector("#totalPrice");
const emptySelection = document.querySelector("#emptySelection");
const selectedSummary = document.querySelector("#selectedSummary");
const summaryImage = document.querySelector("#summaryImage");
const summaryName = document.querySelector("#summaryName");
const summaryPrice = document.querySelector("#summaryPrice");
const orderCount = document.querySelector("#orderCount");
const orderMessage = document.querySelector("#orderMessage");
const placeOrderButton = document.querySelector("#placeOrderButton");
const buttonLabel = placeOrderButton.querySelector(".button-label");
const buttonSpinner = placeOrderButton.querySelector(".button-spinner");
const buttonArrow = placeOrderButton.querySelector(".button-arrow");

let selectedFood = null;

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
            aria-label="Choose ${food.name} for ${formatCurrency(food.price)}"
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
                <span class="choose-label">Choose <i class="bi bi-arrow-right"></i></span>
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

function getQuantity() {
  const quantity = Number.parseInt(quantityInput.value, 10);
  return Number.isInteger(quantity) ? quantity : 1;
}

function updateOrderDetails() {
  const quantity = Math.min(20, Math.max(1, getQuantity()));
  quantityInput.value = String(quantity);

  document.querySelectorAll(".food-card").forEach((card) => {
    const isSelected = card.dataset.foodId === selectedFood?.id;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });

  if (!selectedFood) {
    foodSelect.value = "";
    priceInput.value = "0.00";
    totalPrice.textContent = formatCurrency(0);
    orderCount.textContent = "0";
    emptySelection.classList.remove("d-none");
    selectedSummary.classList.add("d-none");
    return;
  }

  foodSelect.value = selectedFood.id;
  foodSelect.setCustomValidity("");
  priceInput.value = selectedFood.price.toFixed(2);
  totalPrice.textContent = formatCurrency(selectedFood.price * quantity);
  orderCount.textContent = String(quantity);

  summaryImage.src = selectedFood.image;
  summaryImage.alt = selectedFood.name;
  summaryName.textContent = selectedFood.name;
  summaryPrice.textContent = `${formatCurrency(selectedFood.price)} each`;
  emptySelection.classList.add("d-none");
  selectedSummary.classList.remove("d-none");
}

function selectFood(foodId) {
  selectedFood = foodItems.find((food) => food.id === foodId) ?? null;
  hideMessage();
  updateOrderDetails();
}

function adjustQuantity(change) {
  const nextQuantity = Math.min(20, Math.max(1, getQuantity() + change));
  quantityInput.value = String(nextQuantity);
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
    selectedFood ? "" : "Please choose a food item.",
  );

  const quantity = getQuantity();
  quantityInput.setCustomValidity(
    quantity >= 1 && quantity <= 20 ? "" : "Choose a quantity from 1 to 20.",
  );

  orderForm.classList.add("was-validated");
  return orderForm.checkValidity();
}

function resetOrder() {
  orderForm.reset();
  orderForm.classList.remove("was-validated");
  customerNameInput.setCustomValidity("");
  foodSelect.setCustomValidity("");
  quantityInput.setCustomValidity("");
  quantityInput.value = "1";
  selectedFood = null;
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

  const order = {
    customer_name: customerNameInput.value,
    food_name: selectedFood.name,
    unit_price: selectedFood.price,
    quantity: getQuantity(),
  };

  setSubmitting(true);

  try {
    const { error } = await supabaseClient.from("orders").insert(order);

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
    selectFood(card.dataset.foodId);
  }
});

foodSelect.addEventListener("change", () => selectFood(foodSelect.value));
quantityInput.addEventListener("input", () => {
  hideMessage();
  updateOrderDetails();
});
quantityInput.addEventListener("blur", updateOrderDetails);
decreaseQuantityButton.addEventListener("click", () => adjustQuantity(-1));
increaseQuantityButton.addEventListener("click", () => adjustQuantity(1));
customerNameInput.addEventListener("input", () => {
  customerNameInput.setCustomValidity("");
  hideMessage();
});
orderForm.addEventListener("submit", placeOrder);
