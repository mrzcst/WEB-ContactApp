/*          TO DO:
- add isValidDate (check if date is 1900 - present)
*/
document.addEventListener('DOMContentLoaded', function() {
    fetchContacts();
    loadCities('city');
});
document.getElementById('addContact').addEventListener('click', addContact);

function addContact() {
    const form = document.getElementById('contactForm');
    if (!form.checkValidity()){
        alert('Completa tutti i campi marcati con * !');
        return;
    };

    const contactData = {
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        gender: document.getElementById('gender').value,
        birthdate: document.getElementById('birthdate').value,
        phonenum: document.getElementById('phonenum').value,
        email: document.getElementById('email').value,
        city: document.getElementById('city').value
    };

    fetch('/data/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error)
            throw new Error(data.error);
        }
        console.log(data.message);
        fetchContacts();
        clearForm();
    })
    .catch(error => {
        console.error("Error",error);
    })
};

function fetchContacts() {
    fetch('/data')
    .then (response => response.json())
    .then (data => {
        updateTable(data);
    })
    .catch(error => {
        console.error('Errore durante il recupero dei dati:', error)
    })
};

function updateTable(data) {
    const dataTable = document.getElementById('contactTableBody');
    dataTable.innerHTML = '';
    data.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.id}</td>
            <td>${entry.name}</td>
            <td>${entry.surname}</td>
        `;
        dataTable.appendChild(row);
        row.addEventListener('click', function (){
            openDetails(entry);
        });
    });
};

function clearForm() {
    const form = document.getElementById('contactForm');
    for (let i = 0; i < form.elements.length; i++) {
        const element = form.elements[i];

        if (['input', 'select'].includes(element.tagName.toLowerCase())) {
          element.value = '';
        };
    };
};

function openDetails(contact) {
    const mTitle = document.querySelector('#contactDetails .modal-title');
    const mBody = document.querySelector('#contactDetails .modal-body');

    mTitle.textContent = contact.name + ' ' + contact.surname;
    mBody.innerHTML = `
        <div class="mb-3">
            <p>E-mail: ${contact.email}</p>
        </div>
        <div class="mb-3">
            <p>Sesso: ${contact.gender}</p>
        </div>
        <div class="mb-3">
            <p>Data di nascita: ${contact.birthdate}</p>
        </div>
        <div class="mb-3">
            <p>Numero di telefono: ${contact.phonenum}</p>
        </div>
        <div class="mb-3">
            <p>Citta: ${contact.city}</p>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('contactDetails'));
    const modalElement = document.getElementById('contactDetails');
    modal.show();
    modalElement.addEventListener('hidden.bs.modal', onModalClose);

    const editBtn = document.getElementById('editContact');
    editBtn.onclick = () => editContact(contact);
};

function editContact(contact) {
    const mBody = document.querySelector('#contactDetails .modal-body');
    mBody.innerHTML = `
        <div class="mb-3">
            <p>E-mail: ${contact.email}</p>
        </div>
        <div class="mb-3">
            <p>Sesso:</p>
            <select class="form-select" id="m-gender">
                <option selected disabled hidden>${contact.gender}</option>
                <option>Male</option>
                <option>Female</option>
                <option>Altro</option>
            </select>
        </div>
        <div class="mb-3">
            <p>Data di nascita:</p>
            <input type="date" class="form-control" id="m-birthdate" value="${contact.birthdate}">
        </div>
        <div class="mb-3"> 
            <p>Numero di telefono:</p>
            <input type="text" class="form-control" id="m-phonenum" value="${contact.phonenum}">
        </div>
        <div class="mb-3"> 
            <p>Citta:</p>
            <select class="form-select" id="m-city">
                <option selected disabled hidden>${contact.city}</option>
            </select>
        </div>
    `;
    loadCities('m-city');

    const editBtn = document.getElementById('editContact');
    const confirmBtn = document.getElementById('confirmEdit');
    editBtn.classList.add('d-none');
    confirmBtn.classList.remove('d-none');

    confirmBtn.onclick = () => updateContact(contact.id);
};

function updateContact(contactID) {
    const editedData = {
        id: contactID,
        gender: document.getElementById('m-gender').value,
        birthdate: document.getElementById('m-birthdate').value,
        phonenum: document.getElementById('m-phonenum').value,
        city: document.getElementById('m-city').value
    };

    fetch('/data/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            throw new Error(data.error);
        }
        console.log(data.message);
        alert(data.message)
        fetchContacts();

    })
    .catch(error => {
        console.error('Errore:', error);
    });
};

function onModalClose() {
    const editBtn = document.getElementById('editContact');
    const confirmBtn = document.getElementById('confirmEdit');
    editBtn.classList.remove('d-none');
    confirmBtn.classList.add('d-none');
};

async function getCities() {
    const res = await fetch('/cities.json');
    const data = await res.json();
    return data;
};

function loadCities(elementID) {
    const citySelect = document.getElementById(elementID);
    const data = getCities();
    data.then(data => {
        const cities = data[0].cities;
        cities.forEach(city => {
            const option = document.createElement('option');
            option.textContent = city;
            citySelect.appendChild(option);
        });
    });
};