import firebaseConfig from '/CONFIG.js';
import { DBPaths } from '/Bus Operator/js/DB.js';
import { convertToPascal, getCurrentDateTimeInMillis } from '/Bus Operator/utils/Utils.js';
// const { Map } = await google.maps.importLibrary('maps');
// const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const modal = document.getElementById("opModal");
const loader = document.querySelector('.loader-container');

const busRadio = document.getElementById('bus');
const busTrackingRadio = document.getElementById('bus-tracking');
const busContent = document.querySelector('.bus-content');
const busTrackingContent = document.querySelector('.bus-tracking-content');

const searchBusInput = document.getElementById('searchBusInput');
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
searchBusInput.addEventListener('input', handleSearchInput);

function init() {
    document.querySelectorAll('.data-filter input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', handleRadioButtonChange);
    });

    generateBuses();
    initMap();

    setInterval(function () {
        // Call initMap function to start the process
        if (busTrackingContent && window.getComputedStyle(busTrackingContent).display !== 'none') {
            // Call initMap only if the parent div is displayed
            initMap();
        }
    }, 25000);

};

function handleSearchInput() {
    generateBusesTableHeader();

    const searchTerm = searchBusInput.value.toLowerCase().trim();

    // Filter data based on search term
    const results = busDriverArray.filter(item => item.plateNumber.toLowerCase().includes(searchTerm));
    // Render search results
    renderResults(results);
}

function renderResults(results) {

    results.forEach(result => {

        generateBusesTables(result);
    });
}

function generateBuses() {

    generateBusesTableHeader();

    const busDriverRef = database.ref(`${DBPaths.BUS_DETAILS}`);
    busDriverArray = [];

    busDriverRef.once('value',
        (snapshot) => {
            snapshot.forEach((busDriver) => {

                const busDriverKey = busDriver.key;
                const busDriverData = busDriver.val();
                busDriverData["key"] = busDriverKey;

                if (busDriverData.companyId === myData.companyId) {
                    busDriverArray.push(busDriverData);
                    generateBusesTables(busDriverData);
                }


            });
        }
    )
}

function generateBusesTableHeader() {
    busTable.innerHTML = '';
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
            plateNumber: plateNumber.value.toUpperCase(),
            datetimeAdded: new Date().toISOString(),
            companyName: myData.companyName,
            companyId: myData.companyId,
            busOperatorId: myData.key
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
            plateNumber: plateNumber.value.toUpperCase(),
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
            });
    }

    hideLoader();
}

function addBus() {
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



//ABOUT MAPS
const googleMap = document.getElementById("googleMap");
const bounds = new google.maps.LatLngBounds();
let allCoor = [];
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

async function initMap() {
    try {
        // Get live driver and passenger coordinates
        await getLiveCoordinates(database.ref(`${DBPaths.LIVE_DRIVERS}`), 'Driver');
        // await getLiveCoordinates(database.ref(`${DBPaths.LIVE_PASSENGERS}`), 'Passenger');

        const map = await createMap(); // Create map after coordinates are retrieved
        addMarkersToMap(map); // Add markers to the created map

    } catch (error) {
        console.error("Error initializing map:", error);
    }
}

async function createMap() {
    const { Map } = await google.maps.importLibrary("maps");

    const mapProp = {
        center: new google.maps.LatLng(10.338427154183488, 123.91196002289311), // Default center
        zoom: 15,
        disableDefaultUI: true,
        mapId: 'BUS_MAP'
    };

    return new Map(googleMap, mapProp);
}

function addMarkersToMap(map) {

    // Check if any coordinates retrieved
    if (!allCoor.length) {
        console.log("No live coordinates found");
    }
    else {
        allCoor.forEach(function (data) {
            putMarker(map, data);
            bounds.extend(data);
        });
        map.fitBounds(bounds);
    }
}

function putMarker(map, data) {

    const markerImg = document.createElement("img");
    markerImg.style.width = '35px'; // Set desired width
    markerImg.style.height = '35px'; // Set desired height

    let infoContent;

    if (data.role === 'Driver') {
        markerImg.src = '/Bus Operator/images/bus_marker.png'
        infoContent = ` \n Bus Code: ${data.dataValue.busCode} |
                        \n Plate Number: ${data.dataValue.plateNumber}`
    }
    else if (data.role === 'Passenger') {
        markerImg.src = '/Bus Operator/images/passenger_marker.png'
    }

    const marker = new AdvancedMarkerElement({
        position: data,
        map: map,
        content: markerImg
    });

    const infowindow = new google.maps.InfoWindow({
        content: infoContent
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.open(map, marker);
    });
}

function getLiveCoordinates(dataRef, dataType) {
    const liveElements = []; // Assuming liveElements is where you store retrieved data

    return dataRef.once('value').then((snapshot) => {
        snapshot.forEach((dataSnapshot) => {
            const dataKey = dataSnapshot.key;
            const dataValue = dataSnapshot.val();
            dataValue["key"] = dataKey;

            liveElements.push(dataValue);

            const coordinates = {
                dataValue: dataValue,
                lat: dataValue.lattitude, // Assuming lattitude exists, check for typos
                lng: dataValue.longitude, // Assuming longitude exists
                role: dataType
            };

            allCoor.push(coordinates);
        });
    });
}

