import { getCurrentDate, convertToDDMMMYYYY, convertToPascal, getCurrentDateTimeInMillis } from '/Bus Operator/utils/Utils.js';
import { DBPaths } from '/Bus Operator/js/DB.js';
import firebaseConfig from '/CONFIG.js';
import NotifType from '/Bus Operator/utils/NotifTypes.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const loader = document.querySelector('.loader-container');
const applicationModalCloseBtn = document.querySelector(".applicationModalCloseBtn");

// Applicant table
const applicantsTable = document.getElementById("bus-table");
const applicantsTablePref = document.getElementById("bus-table-preference");

const searchApplicantsInput = document.getElementById("searchApplicantsInput");
const applicationModal = document.getElementById("applicationModal");
const photoModal = document.getElementById("photoModal");
const docImage = document.getElementById("docImage");
const docCloseBtn = document.querySelector(".docCloseBtn");

// Applicant information
const applicantAnswers = document.getElementById('applicantAnswers');  // Applicant name
const applicantName = document.getElementById('applicantName');  // Applicant name
const applicantEmail = document.getElementById('applicantEmail');  // Applicant email
const applicantPhoneNum = document.getElementById('applicantPhoneNum');  // Applicant phone number
const applicantPhoto = document.getElementById('applicantPhoto');  // Applicant phone number

// Button references
const answeredQuestionsBtn = document.getElementById('answeredQuestionsBtn');  // Answered questions button
const resumeBtn = document.getElementById('resumeBtn');  // Resume/Bio Data button
const driversLicenseBtn = document.getElementById('driversLicenseBtn');  // Driver's license button

// Other information references
const workExperienceH6 = document.getElementById('workExperienceH6');  // Work experience
const addressH6 = document.getElementById('addressH6');  // Address
const educationH6 = document.getElementById('educationH6');  // Education
const addInfoH6 = document.getElementById('addInfoH6');  // Additional information

// Approval buttons
const approveBtn = document.getElementById('approveBtn');  // Approve button
const disapproveBtn = document.getElementById('disapproveBtn');  // Disapprove button

let jobArray;
let applicantsArray;
let applicationId;
let viewedApplicantData;

document.addEventListener('DOMContentLoaded', init);
approveBtn.addEventListener('click', approveApplication);
disapproveBtn.addEventListener('click', disapproveApplication);
applicationModalCloseBtn.addEventListener('click', hideApplicationModal);
docCloseBtn.addEventListener('click', hideDocImage);
searchApplicantsInput.addEventListener('input', handleSearchInput);


function init() {
    generateApplicants();
};

function handleSearchInput() {
    createApplicationTableHeaders();

    const searchTerm = searchApplicantsInput.value.toLowerCase().trim();
    // Filter data based on search term
    const results = applicantsArray.filter(item => item.workExperience.toLowerCase().includes(searchTerm));
    // Render search results
    results.forEach(result => {
        console.log(result)
        createApplicationTables(result);
    });
}

function generateApplicants() {
    createApplicationTableHeaders();

    const applicationsRef = database.ref(`${DBPaths.APPLICATIONS}`);
    applicantsArray = [];
    const status = 'pending'

    applicationsRef.once('value',
        (snapshot) => {
            snapshot.forEach((application) => {

                const applicationKey = application.key;
                const applicationData = application.val();
                applicationData["key"] = applicationKey;

                if (applicationData.status.toLowerCase() == status) {
                    getJobDetails(applicationData)
                }
            });
        }
    )
}

function generatePrefApplicants() {
    createApplicationTableHeaders();

    const applicationsRef = database.ref(`${DBPaths.APPLICATIONS}`);
    applicantsArray = [];

    applicationsRef.once('value',
        (snapshot) => {
            snapshot.forEach((application) => {

                const applicationKey = application.key;
                const applicationData = application.val();
                applicationData["key"] = applicationKey;

                getJobDetails(applicationData)
            });
        }
    )
}

function getJobDetails(applicationData) {

    const ref = database.ref(`${DBPaths.JOB}/${applicationData.jobId}`);

    ref.once('value',
        (snapshot) => {

            if (snapshot.exists()) {

                const jobData = snapshot.val();

                if (
                    jobData.companeName == myData.companeName
                ) {
                    retrieveApplicantsData(applicationData);
                }
            }
        }
    )
}


function retrieveApplicantsData(applicationData) {

    const passengerRef = database.ref(`${DBPaths.PASSENGER}/${applicationData.applicantId}`);
    jobArray = [];

    passengerRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            const passengerKey = snapshot.key;
            const passengerData = snapshot.val();
            applicationData['passengerData'] = passengerData;
            retrieveJobData(applicationData);
        }
    });
}

function retrieveJobData(applicationData) {

    applicantsArray = [];

    const jobRef = database.ref(`${DBPaths.JOB}/${applicationData.jobId}`);
    jobArray = [];

    jobRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            const jobKey = snapshot.key;
            const jobData = snapshot.val();
            jobData['key'] = jobKey;
            applicationData['jobData'] = jobData;
            applicantsArray.push(applicationData);
            createApplicationTables(applicationData, jobData);
        }
    }
    )
}

function createApplicationTableHeaders() {

    applicantsTable.innerHTML = "";
    applicantsTablePref.innerHTML = "";
    const tr = document.createElement("tr");
    const tr2 = document.createElement("tr");

    // Array of column headers
    const headers = [
        "ID no.",
        "Fullname",
        "Job Applied",
        "Work Experience",
        "Education",
        "Address",
        // "Actions",
    ];

    // Create <th> elements for each column header and append them to the <tr> element
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        tr.appendChild(th);

        const th2 = document.createElement("th");
        th2.textContent = headerText;
        tr2.appendChild(th2);
    });

    applicantsTable.appendChild(tr);
    applicantsTablePref.appendChild(tr2);
}

function createApplicationTables(applicationData, jobData) {

    const row = document.createElement("tr");

    const applicantIdNoTd = document.createElement("td");
    applicantIdNoTd.textContent = applicationData.key;

    const applicantDriverTd = document.createElement("td");
    applicantDriverTd.textContent = convertToPascal(applicationData.passengerData.fullName);

    const jobApplied = document.createElement("td");
    jobApplied.textContent = convertToPascal(applicationData.jobData.title);

    const workExperience = document.createElement("td");
    workExperience.textContent = convertToPascal(applicationData.workExperience);

    const education = document.createElement("td");
    education.textContent = convertToPascal(applicationData.educationalAttainment);

    const address = document.createElement("td");
    address.textContent = convertToPascal(applicationData.address);

    row.appendChild(applicantIdNoTd);
    row.appendChild(applicantDriverTd);
    row.appendChild(jobApplied);
    row.appendChild(workExperience);
    row.appendChild(education);
    row.appendChild(address);
    // row.appendChild(actionsTd);

    applicantsTable.appendChild(row);

    if (jobData.preferences == applicationData.workExperience) {
        applicantsTablePref.appendChild(row);
    }


    row.addEventListener('click', function () {
        viewApplicant(applicationData)
    });
}

function viewApplicant(applicationData) {
    viewedApplicantData = applicationData;
    applicationId = applicationData.key;
    createApplicantsAnswersItem(applicationData);
    applicantName.textContent = convertToPascal(applicationData.passengerData.fullName);  // Set the applicant's name
    applicantEmail.textContent = convertToPascal(applicationData.passengerData.email);;  // Set the applicant's email
    applicantPhoneNum.textContent = convertToPascal(applicationData.passengerData.phoneNum);;  // Set the applicant's phone number
    applicantPhoto.src = applicationData.passengerData.imageUrl;

    // Set values for other information
    workExperienceH6.textContent = convertToPascal(applicationData.workExperience);  // Work experience details
    addressH6.textContent = convertToPascal(applicationData.address);  // Address details
    educationH6.textContent = convertToPascal(applicationData.educationalAttainment);  // Education details
    addInfoH6.textContent = convertToPascal(applicationData.additionalInfo);  // Additional information
    resumeBtn.addEventListener('click', function () {
        viewResume(applicationData);
    });
    driversLicenseBtn.addEventListener('click', function () {
        viewLicense(applicationData);
    });
    showApplicationModal();
}

function approveApplication(event) {
    event.preventDefault();
    updateApplication(true);
}

function disapproveApplication(event) {
    event.preventDefault();

    updateApplication(false);
}

function updateApplication(isApproved) {

    const applicationData = {
        status: isApproved ? 'Approved' : 'Disapproved'
    };

    const action = isApproved ? 'approve' : 'disapprove';

    const isConfirmed = window.confirm(`Confirm to ${action} this application?`);

    if (!isConfirmed) {
        return;
    }

    const ref = firebase.database().ref(`${DBPaths.APPLICATIONS}/${applicationId}`);

    ref.update(applicationData)
        .then(() => {
            console.log('Application updated:', applicationData);

            saveInApplicationHistoryDb(action);

            
            
        })
        .catch(error => {
            console.error('Error updating application:', error);
        });
}



function viewResume(applicationData) {
    docImage.src = applicationData.resumeUrl;
    showDocImage();
}

function viewLicense(applicationData) {
    docImage.src = applicationData.licenseUrl;
    showDocImage();
}

function showApplicationModal() {
    applicationModal.style.display = 'block';
}

function hideApplicationModal() {
    applicationModal.style.display = "none";
}

function showDocImage() {
    photoModal.style.display = 'block';
}

function hideDocImage() {
    photoModal.style.display = "none";
}


function saveInApplicationHistoryDb(action) {

    const data = {
        fullName: viewedApplicantData.passengerData.fullName,
        position: viewedApplicantData.jobData.title,
        status: action,
        date: convertToDDMMMYYYY(new Date().toISOString()),
        companyId: myData.companyId,
        companyName: myData.companyName,
        jobId: viewedApplicantData.jobId,
        applicantId: viewedApplicantData.passengerData.fullName
    };

    const id = getCurrentDateTimeInMillis();

    const jobRef = database.ref(`${DBPaths.APPLICATIONS_HISTORY}/${id}`);

    jobRef.set(data)
        .then(() => {

            const notif = {
                dateCreated: getCurrentDate(),
                message: `${myData.fullName} has ${action} your application.`,
                notifType: NotifType.APPLICATION_UPDATE,
                relatedNodeId: myData.key,
                targetUserId: viewedApplicantData.applicantId,
                title: 'Application Update',
            };

            const notifRef = firebase.database().ref(`${DBPaths.NOTIFICATIONS}`);
            notifRef.push(notif);


            hideApplicationModal();
            generateApplicants();
        })
        .catch(error => {
            // An error occurred while setting data
            console.error('Error setting data:', error);
        });


    
}

function createApplicantsAnswersItem(applicationData) {

    const questionnaires = applicationData.qaSets;
    console.log(applicationData.qaSets[0][0]);

    if (Array.isArray(questionnaires) && questionnaires.length > 0) {


        for (let i = 0; i < questionnaires.length; i++) {
            const li = document.createElement('li');
            const questionSpan = document.createElement('span');
            const answerSpan = document.createElement('h3');
            questionSpan.textContent = `${applicationData.qaSets[i][0]}   ${applicationData.qaSets[i][1]}`;
            li.appendChild(questionSpan);
            // li.appendChild(answerSpan);
            applicantAnswers.appendChild(li);
        }

        
    }

    

}