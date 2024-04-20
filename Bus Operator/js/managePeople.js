
import { convertToPascal, getCurrentDateTimeInMillis } from '/Bus Operator/utils/Utils.js';
import { DBPaths } from '/Bus Operator/js/DB.js';
import firebaseConfig from '/CONFIG.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const loader = document.querySelector('.loader-container');
const addEmpFormModal = document.getElementById('employeeModal');
const opCloseBtn = document.querySelector('.opClose');

const employeeTable = document.querySelector(".employee-content > #bus-table");

const addBusopBtn = document.getElementById('addBusopBtn');

// ADD EMPLOYEE FORM ELEMENTS
const addEmpForm = document.getElementById('addEmpForm');
const empFullNameInput = document.getElementById('empFullName');
const empEmailInput = document.getElementById('empEmail');
const empContactNumInput = document.getElementById('empContactNum');
const empPasswordInput = document.getElementById('empPassword');
const empTypeInput = document.getElementById('empType');
const saveBusBtn = document.getElementById('saveBusBtn');


document.addEventListener('DOMContentLoaded', init);
addEmpForm.addEventListener('submit', saveEmpData);
opCloseBtn.addEventListener('click', hideAddBusForm)
addBusopBtn.addEventListener('click', showAddBusForm)



function init() {
    // Add event listener to radio buttons to switch content on change
    const radioButtons = document.querySelectorAll('input[name="data"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            switchContent(this.id);
        });
    });

    generateEmployees();
};

function switchContent(selectedTab) {
    // Get all content divs
    const contentDivs = document.querySelectorAll('.employee-content, .status-content, .account-content');

    // Hide all content divs
    contentDivs.forEach(div => {
        div.style.display = 'none';
    });

    // Show the selected content div based on the selected tab
    if (selectedTab === 'employee') {
        document.querySelector('.employee-content').style.display = 'block';
    } else if (selectedTab === 'status') {
        document.querySelector('.status-content').style.display = 'block';
    } else if (selectedTab === 'account') {
        document.querySelector('.account-content').style.display = 'block';
    }
}



// EMPLOYEE SECTION
function generateEmployees() {

    createTableHeader();
}

function createTableHeader() {

    employeeTable.innerHTML = "";
    const tr = document.createElement("tr");

    // Array of column headers
    const headers = [
        "ID no.",
        "Fullname",
        "Email",
        "Contact No.",
        "Picture",
        "Password",
        "Type",
        "Actions"
    ];

    // Create <th> elements for each column header and append them to the <tr> element
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        tr.appendChild(th);
    });

    employeeTable.appendChild(tr);

}

function saveEmpData(event) {
    event.preventDefault();
    
    console.log(empFullNameInput.value);
    console.log(empEmailInput.value);
    console.log(empContactNumInput.value);
    console.log(empPasswordInput.value);
    console.log(empTypeInput.value);
}

//MISC FUNCTIONS
function showAddBusForm() {
    addEmpFormModal.style.display = 'block';
}

function hideAddBusForm() {
    addEmpFormModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == addEmpFormModal) {
        hideAddBusForm();
    }
}