import firebaseConfig from '/CONFIG.js';
import { DBPaths } from '/Bus Operator/js/DB.js';
import { convertToPascal, getCurrentDateTimeInMillis } from '/Bus Operator/utils/Utils.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const modal = document.getElementById("opModal");
const loader = document.querySelector('.loader-container');

const busRadio = document.getElementById('bus');
const busTrackingRadio = document.getElementById('bus-tracking');
const busContent = document.querySelector('.bus-content');
const busTrackingContent = document.querySelector('.bus-tracking-content');

const form = document.getElementById('addBusForm');
const busCode = document.getElementById('busCode');
const startPoint = document.getElementById('startPoint');
const endPoint = document.getElementById('endPoint');
const plateNumber = document.getElementById('plateNumber');
const saveBusBtn = document.getElementById('saveBusBtn');

const addBusopBtn = document.getElementById('addBusopBtn');
const addBusFormModal = document.getElementById('opModal');
const opCloseBtn = document.querySelector('.opClose');

const busTable = document.getElementById("bus-table");

let busDriverArray;
let action;
let busId;

document.addEventListener('DOMContentLoaded', init);
form.addEventListener('submit', saveBusData);
addBusopBtn.addEventListener('click', addBus)
opCloseBtn.addEventListener('click', hideAddBusForm)

function init() {
    document.querySelectorAll('.data-filter input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', handleRadioButtonChange);
    });

    generateBuses()
};

function generateBuses() {

    busTable.innerHTML = '';
    generateBusesTableHeader();

    const busDriverRef = database.ref(`${DBPaths.BUS_DETAILS}`);
    busDriverArray = [];

    busDriverRef.once('value',
        (snapshot) => {
            snapshot.forEach((busDriver) => {

                const busDriverKey = busDriver.key;
                const busDriverData = busDriver.val();
                busDriverData["key"] = busDriverKey;
                busDriverArray.push(busDriverData);

                generateBusesTables(busDriverData);
            });
        }
    )
}

function generateBusesTableHeader() {

    const newRow = document.createElement("tr");
    const columns = ["ID No.", "Bus Code", "Start Point", "End Point", "Plate Number", "Actions"];

    columns.forEach(function (columnText) {
        const th = document.createElement("th");
        th.textContent = columnText;
        newRow.appendChild(th);
    });

    busTable.appendChild(newRow);
}

function generateBusesTables(busDriverData) {


    const row = document.createElement("tr");

    const idTd = document.createElement("td");
    idTd.textContent = busDriverData.key;

    const busCodeTd = document.createElement("td");
    busCodeTd.textContent = busDriverData.busCode;

    const startPointTd = document.createElement("td");
    startPointTd.textContent = busDriverData.startPoint;

    const endPointTd = document.createElement("td");
    endPointTd.textContent = busDriverData.endPoint;

    const plateNumberTd = document.createElement("td");
    plateNumberTd.textContent = busDriverData.plateNumber;

    const actionsTd = document.createElement("td");
    const editLink = document.createElement("a");
    editLink.href = "#";
    editLink.setAttribute("data-target", "edit-operator");
    const editIcon = document.createElement("i");
    editIcon.classList.add("fa-solid", "fa-user-pen", "edit");
    const editSpan = document.createElement("span");
    editLink.appendChild(editIcon);
    editLink.appendChild(editSpan);

    const deleteLink = document.createElement("a");
    deleteLink.href = "#";
    deleteLink.setAttribute("data-target", "edit-operator");
    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-eraser", "delete");
    const deleteSpan = document.createElement("span");
    deleteLink.appendChild(deleteIcon);
    deleteLink.appendChild(deleteSpan);



    actionsTd.appendChild(editLink);
    actionsTd.appendChild(deleteLink);

    row.appendChild(idTd);
    row.appendChild(busCodeTd);
    row.appendChild(startPointTd);
    row.appendChild(endPointTd);
    row.appendChild(plateNumberTd);
    row.appendChild(actionsTd);

    busTable.appendChild(row);

    editIcon.addEventListener("click", function () {
        editBus(busDriverData)
    });
    deleteIcon.addEventListener("click", function () {
        deleteBus(busDriverData)
    });
}

function saveBusData(event) {
    event.preventDefault()

    const isConfirmed = window.confirm("Are you sure all information are correct?");

    if (isConfirmed) {
        showLoader();
        saveDataInDb();
    }
}

function saveDataInDb() {


    if (action === 'Add') {
        const id = getCurrentDateTimeInMillis();  
        const BusDetails = {
            idNo: id,
            busCode: busCode.value,
            startPoint: startPoint.value,
            endPoint: endPoint.value,
            plateNumber:  plateNumber.value.toUpperCase(),
            datetimeAdded: new Date().toISOString()
        };

        const busDetailsRef = database.ref(`${DBPaths.BUS_DETAILS}/${id}`);
        busDetailsRef.set(BusDetails)
            .then(() => {
                alert('Bus Added Succesfully!');
                hideAddBusForm();
                generateBuses();
            })
            .catch(error => {
                console.error('Error adding bus!');
            });

        hideLoader();
    }

    if (action === 'Edit') {
        const id = busId;    

        const BusDetails = {
            busCode: busCode.value,
            startPoint: startPoint.value,
            endPoint: endPoint.value,
            plateNumber:  plateNumber.value.toUpperCase(),
        };

        const busDetailsRef = firebase.database().ref(`${DBPaths.BUS_DETAILS}/${id}`);
        busDetailsRef.update(BusDetails)
            .then(() => {
                alert('Bus Updated Succesfully!');
                hideAddBusForm();
                generateBuses();
            })
            .catch(error => {
                console.error('Error updating bus!');
            });    }

    hideLoader();
}

function addBus(){
    action = 'Add';
    showAddBusForm();
}

function editBus(busDriverData) {
    action = 'Edit';
    busId = busDriverData.key;

    busCode.value = busDriverData.busCode;
    startPoint.value = busDriverData.startPoint;
    endPoint.value = busDriverData.endPoint;
    plateNumber.value = busDriverData.plateNumber;

    showAddBusForm();
}

function deleteBus(busDriverData) {
    const key = busDriverData.key;

    const isConfirmed = window.confirm("Are you sure you want to remove this account?");

    if (isConfirmed) {

        const dbRef = firebase.database().ref(`${DBPaths.BUS_DETAILS}/${key}`);

        dbRef.remove()
            .then(() => {
                console.log('User data deleted successfully.');
                generateBuses();
            })
            .catch((error) => {
                console.error('Error deleting user data:', error);
            });
    }
}

function handleRadioButtonChange() {
    // Check which radio button is selected
    if (busRadio.checked) {
        busTrackingContent.style.display = 'none';
        busContent.style.display = 'block';
    }
    else if (busTrackingRadio.checked) {
        busContent.style.display = 'none';
        busTrackingContent.style.display = 'block';
    }
}

function showAddBusForm() {    
    addBusFormModal.style.display = 'block';
}

function hideAddBusForm() {
    addBusFormModal.style.display = "none";
}

function showLoader() {
    loader.style.display = 'flex'
}

function hideLoader() {
    setTimeout(function () {
        loader.style.display = "none";
    }, 2000); // 3000 milliseconds = 3 seconds
}

function refreshCurrentPage() {
    // window.location.href = './../manage-bus.html';
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        hideAddBusForm();
    }
}