document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("modalOverlay");
  const openbtn = document.querySelector(".plus-button");
  const addbtn = document.getElementById("addBtn");
  const cancelbtn = document.getElementById("cancelBtn");
  const maincontent = document.getElementById("mainContent");
  const inventorytable = document.getElementById("inventoryTable");

  const searchinput = document.getElementById("searchInput");
  const searchbtn = document.getElementById("searchBtn");

  const sortname = document.getElementById("sortName");
  const sortdate = document.getElementById("sortDate");
  const sortprice = document.getElementById("sortPrice");

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

  const editoverlay = document.getElementById("editOverlay");
  const saveedit = document.getElementById("saveEdit");
  const canceledit = document.getElementById("cancelEdit");
  const editinputs = [
    { element: document.getElementById("editName"), error: null },
    { element: document.getElementById("editDetails"), error: null },
    { element: document.getElementById("editQuantity"), error: null },
    { element: document.getElementById("editPrice"), error: null },
    { element: document.getElementById("editDate"), error: null },
    { element: document.getElementById("editType"), error: null },
  ];
  editinputs.forEach(input => {
    input.error = input.element.parentElement.querySelector(".error");
  });

  let editindex = null;

  function clearform() {
    inputs.forEach(input => {
      input.element.value = "";
      input.error.textContent = "";
    });
    inputs[5].element.value = "";
  }

  function validate(inputsarray) {
    let isvalid = true;
    inputsarray.forEach(input => {
      const val = input.element.value.trim();
      if (val === "" || (input.element.type === "number" && isNaN(val))) {
        input.error.textContent = "Fill up required";
        isvalid = false;
      } else {
        input.error.textContent = "";
      }
    });
    return isvalid;
  }

  function renderinventory(filter = "") {
    inventorytable.innerHTML = "";
    inventory.forEach((item, index) => {
      const match =
        item.name.toLowerCase().includes(filter) ||
        item.details.toLowerCase().includes(filter) ||
        item.type.toLowerCase().includes(filter);

      if (!match) return;

      const newrow = document.createElement("tr");
      newrow.innerHTML = `
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

      newrow.querySelector(".edit-button").addEventListener("click", function () {
        openedit(index);
      });

      newrow.querySelector(".delete-button").addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this item?")) {
          inventory.splice(index, 1);
          localStorage.setItem("inventoryData", JSON.stringify(inventory));
          renderinventory(searchinput.value.toLowerCase());
        }
      });

      inventorytable.appendChild(newrow);
    });
  }

  function sortinventory(criteria, order) {
    inventory.sort((a, b) => {
      if (criteria === "name") {
        const namea = a.name.toLowerCase();
        const nameb = b.name.toLowerCase();
        return order === "asc" ? namea.localeCompare(nameb) : nameb.localeCompare(namea);
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

    renderinventory(searchinput.value.toLowerCase());
  }

  openbtn.addEventListener("click", function (e) {
    e.preventDefault();
    modal.style.display = "flex";
    maincontent.classList.add("blur");
  });

  cancelbtn.addEventListener("click", function () {
    clearform();
    modal.style.display = "none";
    maincontent.classList.remove("blur");
  });

  addbtn.addEventListener("click", function () {
    if (!validate(inputs)) return;

    const newitem = {
      name: inputs[0].element.value.trim(),
      details: inputs[1].element.value.trim(),
      quantity: parseInt(inputs[2].element.value),
      price: parseFloat(inputs[3].element.value),
      date: inputs[4].element.value,
      type: inputs[5].element.value,
    };

    inventory.push(newitem);
    localStorage.setItem("inventoryData", JSON.stringify(inventory));
    renderinventory(searchinput.value.toLowerCase());
    clearform();
    modal.style.display = "none";
    maincontent.classList.remove("blur");
  });

  function openedit(index) {
    const item = inventory[index];
    editindex = index;

    editinputs[0].element.value = item.name;
    editinputs[1].element.value = item.details;
    editinputs[2].element.value = item.quantity;
    editinputs[3].element.value = item.price;
    editinputs[4].element.value = item.date;
    editinputs[5].element.value = item.type;

    editoverlay.style.display = "flex";
    maincontent.classList.add("blur");
  }

  function closeedit() {
    editoverlay.style.display = "none";
    maincontent.classList.remove("blur");
    editinputs.forEach(input => (input.error.textContent = ""));
    editindex = null;
  }

  saveedit.addEventListener("click", function () {
    if (editindex === null) return;
    if (!validate(editinputs)) return;

    inventory[editindex] = {
      name: editinputs[0].element.value.trim(),
      details: editinputs[1].element.value.trim(),
      quantity: parseInt(editinputs[2].element.value),
      price: parseFloat(editinputs[3].element.value),
      date: editinputs[4].element.value,
      type: editinputs[5].element.value,
    };

    localStorage.setItem("inventoryData", JSON.stringify(inventory));
    renderinventory(searchinput.value.toLowerCase());
    closeedit();
  });

  canceledit.addEventListener("click", closeedit);

  if (searchinput && searchbtn) {
    searchbtn.addEventListener("click", function () {
      const query = searchinput.value.trim().toLowerCase();
      if (query === "") {
        searchinput.classList.add("input-error");
        searchinput.placeholder = "Input keywords";
        searchinput.value = "";
        setTimeout(() => {
          searchinput.classList.remove("input-error");
        }, 1000);
        return;
      }

      renderinventory(query);
    });

    searchinput.addEventListener("input", function () {
      searchinput.placeholder = "Search keywords...";
      renderinventory(this.value.toLowerCase());
    });
  }

  sortname.addEventListener("change", function () {
    sortinventory("name", this.value);
  });

  sortdate.addEventListener("change", function () {
    sortinventory("date", this.value);
  });

  sortprice.addEventListener("change", function () {
    sortinventory("price", this.value);
  });

  renderinventory();
});
