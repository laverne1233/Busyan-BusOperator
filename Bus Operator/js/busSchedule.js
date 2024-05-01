
import { convertToMilitaryTime, convertTo12Hour, convertToPascal, getCurrentDateTimeInMillis } from '/Bus Operator/utils/Utils.js';
import { DBPaths } from '/Bus Operator/js/DB.js';
import firebaseConfig from '/CONFIG.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const loader = document.querySelector('.loader-container');
const busSchedTable = document.querySelector(".search > #bus-table");
const searchBusSchedInput = document.getElementById("searchBusSchedInput");

const addBusSchedBtn = document.getElementById("addBusSchedBtn");
const busScheduleModal = document.getElementById("busScheduleModal");
const busSchedFormCloseBtn = document.querySelector(".busSchedFormCloseBtn");
const addBusSchedForm = document.getElementById("addBusSchedForm");
const busInput = document.getElementById("bus");
const busDriverInput = document.getElementById("busDriver");
const conductorInput = document.getElementById("conductor");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");

const routeNoInput = document.getElementById("routeNo");
const driverFullnameInput = document.getElementById("driverFullname");
const conductorFullnameInput = document.getElementById("conductorFullname");

let action;
let busSchedArray;
let busSchedId;

document.addEventListener('DOMContentLoaded', init);
addBusSchedBtn.addEventListener('click', addBusSched);
busSchedFormCloseBtn.addEventListener('click', hideBusSchedForm);
addBusSchedForm.addEventListener('submit', saveBusSchedData);
searchBusSchedInput.addEventListener('input', handleSearchBusSched);

function init() {
    generateBusSchedules();
};

function generateBusSchedules() {
    createBusScheduleTableHeaders();

    const busSchedRef = database.ref(`${DBPaths.BUS_SCHED}`);
    busSchedArray = [];

    busSchedRef.once('value',
        (snapshot) => {
            snapshot.forEach((busSched) => {

                const busSchedKey = busSched.key;
                const busSchedData = busSched.val();
                busSchedData["key"] = busSchedKey;

                if (busSchedData.companyId === myData.companyId) {
                    busSchedArray.push(busSchedData);
                    createBusSchedTables(busSchedData);
                }

            });
        }
    )

}

function handleSearchBusSched() {
    createBusScheduleTableHeaders();

    const searchTerm = searchBusSchedInput.value.toLowerCase().trim();

    const results = busSchedArray.filter(item =>
        item.driverFullname.toLowerCase().includes(searchTerm));

    results.forEach(result => {
        createBusSchedTables(result);
    });
}

function createBusScheduleTableHeaders() {

    busSchedTable.innerHTML = "";
    const tr = document.createElement("tr");

    // Array of column headers
    const headers = [
        "Bus ID no.",
        "Bus Driver",
        "Ass. Conductor",
        "Start Date",
        "End Date",
        "Start Time",
        "End Time",
        "Actions"
    ];

    // Create <th> elements for each column header and append them to the <tr> element
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        tr.appendChild(th);
    });

    busSchedTable.appendChild(tr);
}

function createBusSchedTables(busSchedData) {


    const row = document.createElement("tr");

    const busIdNoTd = document.createElement("td");
    busIdNoTd.textContent = busSchedData.bus;

    const busDriverTd = document.createElement("td");
    busDriverTd.textContent = busSchedData.driverFullname;

    const assConductorTd = document.createElement("td");
    assConductorTd.textContent = busSchedData.conductorFullname === '' ?
        'N/A' : busSchedData.conductorFullname;

    const startDateTd = document.createElement("td");
    startDateTd.textContent = busSchedData.startDate;

    const endDateTd = document.createElement("td");
    endDateTd.textContent = busSchedData.endDate;

    const startTimeTd = document.createElement("td");
    startTimeTd.textContent = busSchedData.startTime;

    const endTimeTd = document.createElement("td");
    endTimeTd.textContent = busSchedData.endTime;

    const actionsTd = document.createElement("td");
    const editLink = document.createElement("a");
    editLink.href = "#";
    editLink.setAttribute("data-target", "edit-operator");
    const editIcon = document.createElement("i");
    editIcon.classList.add("fa-solid", "fa-user-pen", "edit");
    editLink.appendChild(editIcon);

    const deleteLink = document.createElement("a");
    deleteLink.href = "#";
    deleteLink.setAttribute("data-target", "edit-operator");
    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fa-solid", "fa-eraser", "delete");
    deleteLink.appendChild(deleteIcon);

    actionsTd.appendChild(editLink);
    actionsTd.appendChild(deleteLink);

    row.appendChild(busIdNoTd);
    row.appendChild(busDriverTd);
    row.appendChild(assConductorTd);
    row.appendChild(startDateTd);
    row.appendChild(endDateTd);
    row.appendChild(startTimeTd);
    row.appendChild(endTimeTd);
    row.appendChild(actionsTd);

    busSchedTable.appendChild(row);

    editIcon.addEventListener("click", function () {
        editBusSched(busSchedData)
    });
    deleteIcon.addEventListener("click", function () {
        deleteBusSched(busSchedData)
    });
}

function addBusSched() {
    action = 'Add';
    busInput.value = "";
    busDriverInput.value = "";
    conductorInput.value = "";
    startDateInput.value = "";
    endDateInput.value = "";
    startTimeInput.value = "";
    endTimeInput.value = "";

    routeNoInput.value = "";
    driverFullnameInput.value = "";
    conductorFullnameInput.value = "";
    showBusSchedForm();
}

function editBusSched(busSchedData) {
    action = 'Edit';
    busSchedId = busSchedData.key;
    busInput.value = busSchedData.bus;
    busDriverInput.value = busSchedData.busDriver;
    conductorInput.value = busSchedData.conductor;
    startDateInput.value = busSchedData.startDate;
    endDateInput.value = busSchedData.endDate;
    startTimeInput.value = convertToMilitaryTime(busSchedData.startTime);
    endTimeInput.value = convertToMilitaryTime(busSchedData.endTime);

    routeNoInput.value = busSchedData.routeNo;
    driverFullnameInput.value = busSchedData.driverFullname;
    conductorFullnameInput.value = busSchedData.conductorFullname;
    showBusSchedForm();
}

function deleteBusSched(busSchedData) {
    const isConfirmed = window.confirm("Confirm delete?");

    if (isConfirmed) {
        const dbRef = firebase.database().ref(`${DBPaths.BUS_SCHED}/${busSchedData.key}`);

        dbRef.remove()
            .then(() => {
                alert('Bus Schedule deleted successfully.');
                generateBusSchedules();
            })
            .catch((error) => {
                alert('Bus Schedule deletion failed.');
            });
    }
}

function saveBusSchedData(event) {
    event.preventDefault();

    const isConfirmed = window.confirm("Are you sure all information are correct?");

    if (isConfirmed) {
        showLoader();

        if (action === 'Add') {
            createBusSchedule();
        }
        if (action === 'Edit') {
            updateBusSchedule();
        }
    }

    hideLoader();
}

function createBusSchedule() {

    const busDetails = {
        bus: busInput.value,
        busDriver: busDriverInput.value,
        conductor: conductorInput.value,
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        startTime: convertTo12Hour(startTimeInput.value),
        endTime: convertTo12Hour(endTimeInput.value),
        routeNo: routeNoInput.value,
        driverFullname: driverFullnameInput.value,
        conductorFullname: conductorFullnameInput.value,
        datetimeAdded: new Date().toISOString(),
        busOperatorId: myData.key,
        companyName: myData.companyName,
        companyId: myData.companyId,
    };

    const id = getCurrentDateTimeInMillis();

    const busSchedRef = database.ref(`${DBPaths.BUS_SCHED}/${id}`);

    busSchedRef.set(busDetails)
        .then(() => {
            hideBusSchedForm();
            console.log(busDetails);
        })
        .catch(error => {
            // An error occurred while setting data
            console.error('Error setting data:', error);
        });

    hideLoader();
}

function updateBusSchedule() {

    const busDetails = {
        bus: busInput.value,
        busDriver: busDriverInput.value,
        conductor: conductorInput.value,
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        startTime: convertTo12Hour(startTimeInput.value),
        endTime: convertTo12Hour(endTimeInput.value),
        routeNo: routeNoInput.value,
        driverFullname: driverFullnameInput.value,
        conductorFullname: conductorFullnameInput.value,
        busOperatorId: myData.key
    };


    const busSchedRef = firebase.database().ref(`${DBPaths.BUS_SCHED}/${busSchedId}`);
    busSchedRef.update(busDetails)
        .then(() => {
            hideBusSchedForm();
            generateBusSchedules();
        })
        .catch(error => {
            console.error('Error updating report:', error);
        });
}

function showBusSchedForm() {
    busScheduleModal.style.display = 'block';
}

function hideBusSchedForm() {
    busScheduleModal.style.display = "none";
}

function showLoader() {
    loader.style.display = 'flex'
}

function hideLoader() {
    setTimeout(function () {
        loader.style.display = "none";
    }, 2000); // 3000 milliseconds = 3 seconds
}

