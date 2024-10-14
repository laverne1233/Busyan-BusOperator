import { convertToMilitaryTime, convertTo12Hour, getCurrentDate, getCurrentDateTimeInMillis } from '/Bus Operator/utils/Utils.js';
import { DBPaths } from '/Bus Operator/js/DB.js';
import firebaseConfig from '/CONFIG.js';
import NotifType from '/Bus Operator/utils/NotifTypes.js';

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
const driverFullnameInput = document.getElementById("driverFullname");
const conductorFullnameInput = document.getElementById("conductorFullname");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const startTimeInput = document.getElementById("startTime");
const endTimeInput = document.getElementById("endTime");



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
    fetchBusPlateNumbers();
    fetchEmployeeNames();
};

function generateBusSchedules() {
    createBusScheduleTableHeaders();

    const busSchedRef = database.ref(`${DBPaths.BUS_SCHED}`);
    busSchedArray = [];

    busSchedRef.once('value', (snapshot) => {
        snapshot.forEach((busSched) => {
            const busSchedKey = busSched.key;
            const busSchedData = busSched.val();
            busSchedData["key"] = busSchedKey;

            if (busSchedData.companyId === myData.companyId) {
                busSchedArray.push(busSchedData);
                createBusSchedTables(busSchedData);
            }
        });
    });
}

function handleSearchBusSched() {
    createBusScheduleTableHeaders();

    const searchTerm = searchBusSchedInput.value.toLowerCase().trim();

    const results = busSchedArray.filter(item => item.driverFullname.toLowerCase().includes(searchTerm));

    results.forEach(result => {
        createBusSchedTables(result);
    });
}

function createBusScheduleTableHeaders() {
    busSchedTable.innerHTML = "";
    const tr = document.createElement("tr");

    const headers = [
        "Bus Plate Number",
        "Bus Driver",
        "Bus Conductor",
        "Bus Code",
        "Start Date",
        "End Date",
        "Start Time",
        "End Time",
        "Actions"
    ];

    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        tr.appendChild(th);
    });

    busSchedTable.appendChild(tr);
}

function createBusSchedTables(busSchedData) {
    const row = document.createElement("tr");

    const busPlateNumberTd = document.createElement("td");
    const busDetailsRef = database.ref(`${DBPaths.BUS_DETAILS}/${busSchedData.bus}`);
    busDetailsRef.once('value', (snapshot) => {
        const busData = snapshot.val();
        busPlateNumberTd.textContent = busData ? busData.plateNumber : 'N/A';
    });

    const busDriverTd = document.createElement("td");
    const employees = database.ref(`${DBPaths.EMPLOYEES}/${busSchedData.driverFullname}`);
    employees.once('value', (snapshot) => {
        const driverFullnameData = snapshot.val();
        busDriverTd.textContent = driverFullnameData ? driverFullnameData.fullName : 'N/A';
    }); 
    
    const assConductorTd = document.createElement("td");
    const conductorRef = database.ref(`${DBPaths.EMPLOYEES}/${busSchedData.conductorFullname}`);
    conductorRef.once('value', (snapshot) => {
        const conductorData = snapshot.val();
        assConductorTd.textContent = conductorData ? conductorData.fullName : 'N/A';
    });


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
    const busCodeTd = document.createElement("td");
    const busCodeRef = database.ref(`${DBPaths.BUS_DETAILS}/${busSchedData.bus}`);
    busCodeRef.once('value', (snapshot) => {
        const busData = snapshot.val();
        busCodeTd.textContent = busData ? busData.busCode : 'N/A';
    });

    actionsTd.appendChild(editLink);
    actionsTd.appendChild(deleteLink);

    row.appendChild(busPlateNumberTd);
    row.appendChild(busDriverTd);
    row.appendChild(assConductorTd);
    row.appendChild(busCodeTd);
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
    // Clear all input fields
    busInput.value = "";
    driverFullnameInput.value = "";
    conductorFullnameInput.value = "";
    startDateInput.value = "";
    endDateInput.value = "";
    startTimeInput.value = "";
    endTimeInput.value = "";

    
    

    // Set default value for bus input
    const defaultBusPlateNumber = busInput.options[0].value;
    busInput.value = defaultBusPlateNumber;

    showBusSchedForm();
}


function editBusSched(busSchedData) {
    action = 'Edit';
    busSchedId = busSchedData.key;
    busInput.value = busSchedData.bus;
    driverFullnameInput.value = busSchedData.driverFullname;
    conductorFullnameInput.value = busSchedData.conductorFullname;
    startDateInput.value = busSchedData.startDate;
    endDateInput.value = busSchedData.endDate;
    startTimeInput.value = convertToMilitaryTime(busSchedData.startTime);
    endTimeInput.value = convertToMilitaryTime(busSchedData.endTime);
    
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

    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const currentDate = new Date();
    
    // Validation for start date ahead of end date
    if (startDate > endDate) {
        alert("Start date cannot be ahead of end date.");
        return;
    }

    // Validation for start date earlier than the current date (for adding new bus schedule)
    if (action === 'Add' && startDate < currentDate) {
        // No need to show an error message, just proceed
    } else if (action !== 'Edit' && startDate < currentDate) {
        alert("Start date cannot be earlier than the current date.");
        return;
    }

    const isConfirmed = window.confirm("Are you sure all information are correct?");

    if (isConfirmed) {
        showLoader();

        if (action === 'Add') {
            createBusSchedule();
        }
        if (action === 'Edit') {
            updateBusSchedule();
        }

        // Reload the page after saving
        setTimeout(function() {
            location.reload();
        }, 2000); // Reload after 2 seconds (adjust as needed)
    }

    hideLoader();
}







function createBusSchedule() {
    const busDetails = {
        bus: busInput.value,
        driverFullname: driverFullnameInput.value,
        conductorFullname: conductorFullnameInput.value,
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        startTime: convertTo12Hour(startTimeInput.value),
        endTime: convertTo12Hour(endTimeInput.value),
        datetimeAdded: new Date().toISOString(),
        busOperatorId: myData.key,
        companyName: myData.companyName,
        companyId: myData.companyId,
        isApproved: false
    };

    const id = getCurrentDateTimeInMillis();

    const busSchedRef = database.ref(`${DBPaths.BUS_SCHED}/${id}`);

    busSchedRef.set(busDetails)
        .then(() => {
            const loginDetailsData = {
                dateCreated: getCurrentDate(),
                message: "New Bus Schedule Added",
                notifType: NotifType.BUS_SCHEDULE,
                relatedNodeId: myData.key,
                targetUserId: busDetails.bus,
                title: 'Bus Schedule Added',
            }

            const userRef = database.ref(`${DBPaths.NOTIFICATIONS}`);

            userRef.push(loginDetailsData)
                .then(() => {
                    hideBusSchedForm();
                    console.log(busDetails);
                })
                .catch(error => {
                    console.error('Error setting data:', error);
                });

        })
        .catch(error => {
            console.error('Error setting data:', error);
        });

    hideLoader();
}

function updateBusSchedule() {
    const busDetails = {
        bus: busInput.value,
        driverFullname: driverFullnameInput.value,
        conductorFullname: conductorFullnameInput.value,
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        startTime: convertTo12Hour(startTimeInput.value),
        endTime: convertTo12Hour(endTimeInput.value),
        
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
    loader.style.display = 'flex';
}

function hideLoader() {
    setTimeout(function () {
        loader.style.display = "none";
    }, 2000); // 3000 milliseconds = 3 seconds
}

// Fetch existing bus plate numbers within the same company and populate select options
function fetchBusPlateNumbers() {
    const busRef = database.ref(`${DBPaths.BUS_DETAILS}`);
    busRef.once('value', (snapshot) => {
        const busDetails = snapshot.val();
        const myCompanyId = myData.companyId; // Assuming myData contains company information
        const busSelect = document.getElementById('bus');
        busSelect.innerHTML = ''; // Clear existing options

        for (const key in busDetails) {
            if (busDetails.hasOwnProperty(key)) {
                const { idNo, plateNumber, companyId } = busDetails[key];
                if (companyId === myCompanyId) { // Filter by company ID
                    const option = document.createElement('option');
                    option.value = idNo; // Store idNo as the value
                    option.textContent = plateNumber; // Display plateNumber as the text
                    busSelect.appendChild(option);
                }
            }
        }
    });
}



// Populate select options with bus plate numbers
function populateBusSelectOptions(busPlateNumbers) {
    const busSelect = document.getElementById('bus');
    busSelect.innerHTML = ''; // Clear existing options

    busPlateNumbers.forEach((plateNumber) => {
        const option = document.createElement('option');
        option.value = plateNumber;
        option.textContent = plateNumber;
        busSelect.appendChild(option);
    });
}

function fetchEmployeeNames() {
    const employeeRef = database.ref(`${DBPaths.EMPLOYEES}`);
    employeeRef.once('value', (snapshot) => {
        const drivers = [];
        const conductors = [];
        snapshot.forEach((employee) => {
            const employeeData = employee.val();
            if (employeeData.companyId === myData.companyId) {
                if (employeeData.type === 'Driver') {
                    drivers.push({ id: employee.key, fullName: employeeData.fullName });
                } else if (employeeData.type === 'Conductor') {
                    conductors.push({ id: employee.key, fullName: employeeData.fullName });
                }
            }
        });
        populateDriverSelectOptions(drivers); // Call the function to populate the select options for drivers
        populateConductorSelectOptions(conductors); // Call the function to populate the select options for conductors
    });
}

function populateConductorSelectOptions(employees) {
    const conductorSelect = document.getElementById('conductorFullname');
    conductorSelect.innerHTML = ''; // Clear existing options

    employees.forEach((employee) => {
        const option = document.createElement('option');
        option.value = employee.id; // Store id as the value
        option.textContent = employee.fullName; // Display fullname as the text
        conductorSelect.appendChild(option);
    });
}




function populateDriverSelectOptions(employees) {
    const driverSelect = document.getElementById('driverFullname');
    driverSelect.innerHTML = ''; // Clear existing options

    employees.forEach((employee) => {
        const option = document.createElement('option');
        option.value = employee.id; // Store id as the value
        option.textContent = employee.fullName; // Display fullname as the text
        driverSelect.appendChild(option);
    });
}



