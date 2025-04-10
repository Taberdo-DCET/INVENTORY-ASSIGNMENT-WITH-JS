document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modalOverlay");
  const openBtn = document.querySelector(".plus-button");
  const addButton = document.getElementById("addBtn");
  const cancelButton = document.getElementById("cancelBtn");
  const mainContent = document.getElementById("mainContent");
  const table = document.getElementById("inventoryTable");

  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  const sortName = document.getElementById("sortName");
  const sortDate = document.getElementById("sortDate");
  const sortPrice = document.getElementById("sortPrice");

  let inventory = JSON.parse(localStorage.getItem("inventoryData")) || [];

  const inputs = [
    { element: document.getElementById("name"), error: null },
    { element: document.getElementById("details"), error: null },
    { element: document.getElementById("quantity"), error: null },
    { element: document.getElementById("price"), error: null },
    { element: document.getElementById("date"), error: null },
    { element: document.getElementById("type"), error: null },
  ];
  inputs.forEach(input => {
    input.error = input.element.parentElement.querySelector(".error");
  });

  const editOverlay = document.getElementById("editOverlay");
  const saveEditBtn = document.getElementById("saveEdit");
  const cancelEditBtn = document.getElementById("cancelEdit");
  const editInputs = [
    { element: document.getElementById("editName"), error: null },
    { element: document.getElementById("editDetails"), error: null },
    { element: document.getElementById("editQuantity"), error: null },
    { element: document.getElementById("editPrice"), error: null },
    { element: document.getElementById("editDate"), error: null },
    { element: document.getElementById("editType"), error: null },
  ];
  editInputs.forEach(input => {
    input.error = input.element.parentElement.querySelector(".error");
  });

  let editIndex = null;

  function clearForm() {
    inputs.forEach(input => {
      input.element.value = "";
      input.error.textContent = "";
    });
    inputs[5].element.value = "";
  }

  function validate(inputsArray) {
    let isValid = true;
    inputsArray.forEach(input => {
      const val = input.element.value.trim();
      if (val === "" || (input.element.type === "number" && isNaN(val))) {
        input.error.textContent = "Fill up required";
        isValid = false;
      } else {
        input.error.textContent = "";
      }
    });
    return isValid;
  }

  function renderInventory(filter = "") {
    table.innerHTML = "";
    inventory.forEach((item, index) => {
      const match =
        item.name.toLowerCase().includes(filter) ||
        item.details.toLowerCase().includes(filter) ||
        item.type.toLowerCase().includes(filter);

      if (!match) return;

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.details}</td>
        <td style="text-align:right">${item.price}$</td>
        <td>${item.quantity}</td>
        <td>${item.date}</td>
        <td>
          <button class="icon-only edit-button">
            <img src="https://cdn-icons-png.flaticon.com/512/8748/8748504.png" alt="Edit" />
          </button> 
          <button class="icon-only delete-button">
            <img src="https://images.icon-icons.com/1808/PNG/512/trash-can_115312.png" alt="Remove" />
          </button>
        </td>
      `;

      newRow.querySelector(".edit-button").addEventListener("click", function () {
        openEditModal(index);
      });

      newRow.querySelector(".delete-button").addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this item?")) {
          inventory.splice(index, 1);
          localStorage.setItem("inventoryData", JSON.stringify(inventory));
          renderInventory(searchInput.value.toLowerCase());
        }
      });

      table.appendChild(newRow);
    });
  }

  function sortInventory(criteria, order) {
    inventory.sort((a, b) => {
      if (criteria === "name") {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return order === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      }
      if (criteria === "date") {
        return order === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (criteria === "price") {
        return order === "asc" ? a.price - b.price : b.price - a.price;
      }
      return 0;
    });

    renderInventory(searchInput.value.toLowerCase());
  }

  openBtn.addEventListener("click", function (e) {
    e.preventDefault();
    modal.style.display = "flex";
    mainContent.classList.add("blur");
  });

  cancelButton.addEventListener("click", function () {
    clearForm();
    modal.style.display = "none";
    mainContent.classList.remove("blur");
  });

  addButton.addEventListener("click", function () {
    if (!validate(inputs)) return;

    const newItem = {
      name: inputs[0].element.value.trim(),
      details: inputs[1].element.value.trim(),
      quantity: parseInt(inputs[2].element.value),
      price: parseFloat(inputs[3].element.value),
      date: inputs[4].element.value,
      type: inputs[5].element.value,
    };

    inventory.push(newItem);
    localStorage.setItem("inventoryData", JSON.stringify(inventory));
    renderInventory(searchInput.value.toLowerCase());
    clearForm();
    modal.style.display = "none";
    mainContent.classList.remove("blur");
  });

  function openEditModal(index) {
    const item = inventory[index];
    editIndex = index;

    editInputs[0].element.value = item.name;
    editInputs[1].element.value = item.details;
    editInputs[2].element.value = item.quantity;
    editInputs[3].element.value = item.price;
    editInputs[4].element.value = item.date;
    editInputs[5].element.value = item.type;

    editOverlay.style.display = "flex";
    mainContent.classList.add("blur");
  }

  function closeEditModal() {
    editOverlay.style.display = "none";
    mainContent.classList.remove("blur");
    editInputs.forEach(input => (input.error.textContent = ""));
    editIndex = null;
  }

  saveEditBtn.addEventListener("click", function () {
    if (editIndex === null) return;
    if (!validate(editInputs)) return;

    inventory[editIndex] = {
      name: editInputs[0].element.value.trim(),
      details: editInputs[1].element.value.trim(),
      quantity: parseInt(editInputs[2].element.value),
      price: parseFloat(editInputs[3].element.value),
      date: editInputs[4].element.value,
      type: editInputs[5].element.value,
    };

    localStorage.setItem("inventoryData", JSON.stringify(inventory));
    renderInventory(searchInput.value.toLowerCase());
    closeEditModal();
  });

  cancelEditBtn.addEventListener("click", closeEditModal);

  if (searchInput && searchBtn) {
    searchBtn.addEventListener("click", function () {
      const query = searchInput.value.trim().toLowerCase();
      if (query === "") {
        searchInput.classList.add("input-error");
        searchInput.placeholder = "Input keywords";
        searchInput.value = "";
        setTimeout(() => {
          searchInput.classList.remove("input-error");
        }, 1000);
        return;
      }

      renderInventory(query);
    });

    searchInput.addEventListener("input", function () {
      searchInput.placeholder = "Search keywords...";
      renderInventory(this.value.toLowerCase());
    });
  }

  sortName.addEventListener("change", function () {
    sortInventory("name", this.value);
  });

  sortDate.addEventListener("change", function () {
    sortInventory("date", this.value);
  });

  sortPrice.addEventListener("change", function () {
    sortInventory("price", this.value);
  });

  renderInventory();
});
