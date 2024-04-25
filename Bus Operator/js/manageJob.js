import { convertToDDMMMYYYY, convertTo12Hour, convertToPascal, getCurrentDateTimeInMillis } from '/Bus Operator/utils/Utils.js';
import { DBPaths } from '/Bus Operator/js/DB.js';
import firebaseConfig from '/CONFIG.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const loader = document.querySelector('.loader-container');
const jobContainer = document.querySelector(".job-container");
const searchJobInput = document.getElementById("searchJobInput");

const addJobBtn = document.getElementById("addJobBtn");
const jobModal = document.getElementById("jobModal");
const jobFormCloseBtn = document.querySelector(".jobFormCloseBtn");

// References to the primary form
const addJobForm = document.getElementById('addJobForm');

// References to the labeled input fields in the form
const jobTitleInput = document.getElementById('jobTitle');  // Job Title input
const companyNameInput = document.getElementById('companyName');  // Company name input
const companyAddressInput = document.getElementById('companyAddress');  // Company address input
const salaryInput = document.getElementById('salary');  // Salary input

// References to other elements in the form
const companyPhotoImg = document.getElementById('employeePhoto');  // Employee photo image
const uploadJobImgInput = document.getElementById('uploadJobImg');  // File upload button

// References to text areas in the form
const jobTypeInput = document.getElementById('jobTypeInput');  // Job Highlights textarea
const jobHighlightsTextArea = document.getElementById('jobHighlights');  // Job Highlights textarea
const qualificationsTextArea = document.getElementById('qualifications');  // Qualifications textarea
const applicationInstructionsTextArea = document.getElementById('applicationInstructions');  // Application instructions textarea
const aboutCompanyTextArea = document.getElementById('aboutCompany');  // About the company textarea

// References to the input and the list
const questionnaireInput = document.getElementById('questionnaire');  // The input where the question is entered
const questionnaireList = document.getElementById('questionnaireList');  // The <ul> where questions will be added

// Reference to the "Add question" label
const addQuestionLabel = document.getElementById('addQuestionBtn');

// Reference to the form's submit button
const saveJobButton = document.getElementById('saveJob');  // Save button

let action;
let jobArray;
let jobId;
let fileNameJobPhoto;
let fileJobPhoto;
let questionnaireArray = [];


document.addEventListener('DOMContentLoaded', init);
addJobBtn.addEventListener('click', addJob);
jobFormCloseBtn.addEventListener('click', hideJobForm);
addJobForm.addEventListener('submit', saveJobData);
addQuestionLabel.addEventListener('click', addQuestion);  // Trigger `addQuestion` function on click
// searchJobInput.addEventListener('input', handleSearchJob);

function init() {
    generateJobs();
};

function generateJobs() {
    const jobRef = database.ref(`${DBPaths.JOB}`);
    jobArray = [];
    questionnaireArray = [];

    jobRef.once('value',
        (snapshot) => {
            snapshot.forEach((job) => {

                const jobKey = job.key;
                const jobData = job.val();
                jobData["key"] = jobKey;
                jobArray.push(jobData);

                createJobCard(jobData);
            });
        }
    )
}

function createJobCard(jobData) {
    jobContainer.innerText = '';

    // Create the main job card container
    const jobCard = document.createElement('div');
    jobCard.className = 'job-card';  // Set class name for styling

    // Create and append the job title (h5)
    const jobTitle = document.createElement('h5');
    jobTitle.textContent = jobData.title;
    jobCard.appendChild(jobTitle);

    // Create and append the company name (h6)
    const companyName = document.createElement('h6');
    companyName.textContent = jobData.company;
    jobCard.appendChild(companyName);

    // Create and append the job location with icon (h5)
    const locationElement = document.createElement('h5');
    locationElement.innerHTML = `<i class="fa-solid fa-location-dot"></i>${jobData.location}`;
    jobCard.appendChild(locationElement);

    // Create and append the salary range (p)
    const salary = document.createElement('p');
    salary.textContent = jobData.salary;
    jobCard.appendChild(salary);

    // Create and append the date posted (span)
    const dateSpan = document.createElement('span');
    dateSpan.textContent = jobData.postDate;
    jobCard.appendChild(dateSpan);

    // Append the job card to the job container
    jobContainer.appendChild(jobCard);

    jobCard.addEventListener('click', function () {
        editJob(jobData);
    })
}

function addQuestion() {
    const questionText = questionnaireInput.value.trim();  // Get the input text and trim whitespace

    if (questionText !== '') {  // Only add if there's text
        questionnaireArray.push(questionText);
    }

    createQuestionnaireList();
}

function createQuestionnaireList() {
    questionnaireList.innerText = '';

    if(questionnaireArray != undefined) {
        questionnaireArray.map((questione) => {
            const newListItem = document.createElement('li');  // Create a new <li>
            const deleteButton = document.createElement('i');
            deleteButton.className = 'fa-solid fa-trash';
            deleteButton.style.cursor = 'pointer';  // Change the cursor to indicate interactivity
            deleteButton.style.color = 'red';  // Make it visually distinctive
            deleteButton.style.marginLeft = '10px';
        
            newListItem.textContent = questione;  // Set the text of the <li>
        
            questionnaireInput.value = '';  // Clear the input field after adding
        
            // Event listener to remove the item when the delete button is clicked
            deleteButton.addEventListener('click', () => {
                newListItem.remove();  // Remove the list item
            });
    
            questionnaireList.appendChild(newListItem);  // Append the <li> to the <ul>
            newListItem.appendChild(deleteButton);
        });
    }
    
}

function addJob() {
    action = 'Add';
    jobTitleInput.value = '';  // Clear Job Title
    companyNameInput.value = '';  // Clear Company Name
    companyAddressInput.value = '';  // Clear Company Address
    salaryInput.value = '';  // Clear Salary

    // Clear the image and file input (reset file input)
    companyPhotoImg.src = './images/profile.png';  // Reset to default image
    uploadJobImgInput.value = '';  // Clear file input

    // Reset textareas to empty strings
    jobTypeInput.value = '';  // Clear Job Type
    jobHighlightsTextArea.value = '';  // Clear Job Highlights
    qualificationsTextArea.value = '';  // Clear Qualifications
    applicationInstructionsTextArea.value = '';  // Clear Application Instructions
    aboutCompanyTextArea.value = '';  // Clear About the Company    
    showJobForm();
}

function editJob(jobData) {
    action = 'Edit';
    jobId = jobData.key;
    jobTitleInput.value = jobData.title;
    companyNameInput.value = jobData.company;
    companyAddressInput.value = jobData.location;
    salaryInput.value = jobData.salary;

    // Clear the image and file input (reset file input)
    companyPhotoImg.src = jobData.companyPhotoUrl;

    // Reset textareas to empty strings
    jobTypeInput.value = jobData.jobType;
    jobHighlightsTextArea.value = jobData.description;
    qualificationsTextArea.value = jobData.qualifications;
    applicationInstructionsTextArea.value = jobData.applicationInstructions;
    aboutCompanyTextArea.value = jobData.aboutCompany;
    questionnaireArray = jobData.questionnaires;
    createQuestionnaireList(questionnaireArray);
    showJobForm();
}

function deleteJob(jobData) {

}

function saveJobData(event) {
    event.preventDefault();

    const isConfirmed = window.confirm("Are you sure all information are correct?");

    if (isConfirmed && jobDetailsAreValid()) {
        showLoader();

        if (action === 'Add') {
            uploadCompanyImage();
        }
        if (action === 'Edit') {
            validateImage();
        }
    }

    hideLoader();
}

function validateImage() {

    if (uploadJobImgInput && (uploadJobImgInput.files.length === 0 || uploadJobImgInput.value === '')) {
        const imgeSrc = companyPhotoImg.src;
        updateJob(imgeSrc);
        console.log('With out Photo');

    }
    else {
        uploadCompanyImage();
        console.log('With Photo');
    }

    hideLoader();
}

function uploadCompanyImage() {
    const ref = firebase.storage().ref(`${DBPaths.JOB}`);

    const metadata = {
        contentType: fileJobPhoto.type
    };

    const task = ref.child(fileNameJobPhoto).put(fileJobPhoto, metadata);

    // Monitor the upload progress
    task.on('state_changed',
        function (snapshot) {
            // Handle progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload company coop photo is ' + progress + '% done');
        },
        function (error) {
            // Handle errors
            console.error('Error uploading file: ', error);
        },
        function () {
            // Handle successful upload
            task.snapshot.ref.getDownloadURL().then(function (downloadURL) {

                if (action === 'Add') {
                    createJob(downloadURL);
                }
                if (action === 'Edit') {
                    updateJob(downloadURL);
                }

            });
        }
    );
}

function createJob(downloadURL) {
    const jobData = {
        title: jobTitleInput.value,  // Job Title
        company: companyNameInput.value,  // Company Name
        location: companyAddressInput.value,  // Company Address
        salary: salaryInput.value,  // Salary
        companyPhotoUrl: downloadURL,  // Employee Photo source
        jobType: jobTypeInput.value,  // Job Type
        description: jobHighlightsTextArea.value,  // Job Highlights
        qualifications: qualificationsTextArea.value,  // Qualifications
        applicationInstructions: applicationInstructionsTextArea.value,  // Application Instructions
        aboutCompany: aboutCompanyTextArea.value,  // About the Company
        questionnaires: questionnaireArray,
        postDate: convertToDDMMMYYYY(new Date().toISOString()),
        busOperatorId: myData.key
    };

    const id = getCurrentDateTimeInMillis();

    const jobRef = database.ref(`${DBPaths.JOB}/${id}`);

    jobRef.set(jobData)
        .then(() => {
            hideJobForm();
            generateJobs();
        })
        .catch(error => {
            // An error occurred while setting data
            console.error('Error setting data:', error);
        });

    hideLoader();

}

function updateJob(downloadURL) {
    const jobData = {
        title: jobTitleInput.value,  // Job Title
        company: companyNameInput.value,  // Company Name
        location: companyAddressInput.value,  // Company Address
        salary: salaryInput.value,  // Salary
        companyPhotoUrl: downloadURL,  // Employee Photo source
        jobType: jobTypeInput.value,  // Job Type
        description: jobHighlightsTextArea.value,  // Job Highlights
        qualifications: qualificationsTextArea.value,  // Qualifications
        applicationInstructions: applicationInstructionsTextArea.value,  // Application Instructions
        questionnaires: questionnaireArray
    };

    const jobRef = firebase.database().ref(`${DBPaths.JOB}/${jobId}`);
    jobRef.update(jobData)
        .then(() => {
            hideJobForm();
            generateJobs();
        })
        .catch(error => {
            console.error('Error updating job:', error);
        });
}

function jobDetailsAreValid() {

    // Check if user photo is different from the placeholder image
    const uploadJobImgInput = companyPhotoImg.src.includes('/images/profile.png');

    if (uploadJobImgInput) {
        alert('Please select a company photo');
        return false;
    }

    return true;
}

function showJobForm() {
    jobModal.style.display = 'block';
}

function hideJobForm() {
    jobModal.style.display = "none";
}

function showLoader() {
    loader.style.display = 'flex'
}

function hideLoader() {
    setTimeout(function () {
        loader.style.display = "none";
    }, 2000); // 3000 milliseconds = 3 seconds
}

window.addEventListener('load', function () {

    uploadJobImgInput.addEventListener('change', function (event) {
        if (this.files && this.files[0]) {
            companyPhotoImg.onload = () => {
                URL.revokeObjectURL(companyPhotoImg.src);
            }
            companyPhotoImg.src = URL.createObjectURL(this.files[0]);
            fileNameJobPhoto = this.files[0].name;
            fileJobPhoto = event.target.files[0];
        }
    });
});
