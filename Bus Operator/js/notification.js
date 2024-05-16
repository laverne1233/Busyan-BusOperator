import firebaseConfig from '/CONFIG.js';
import { DBPaths } from '/Bus Operator/js/DB.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

let notifsArray
let notifModel = {
    date: "",
    message: "",
}

document.addEventListener('DOMContentLoaded', generateNotifs);


function compareDates(a, b) {
    const dateA = new Date(a.applicationDateCreated || a.date).getTime();
    const dateB = new Date(b.applicationDateCreated || b.date).getTime();
    return dateA - dateB;
}

function generateNotifs() {
    notifsArray = [];

    const revisionPromise = new Promise((resolve, reject) => {
        const revisionRef = database.ref(`${DBPaths.REVISION_REQUESTS}`);
        revisionRef.once('value',
            (snapshot) => {
                snapshot.forEach((notif) => {
                    const data = notif.val();
                    if (data.busDriverId === myData.companyName) {
                        const notifModel = {
                            date: data.date,
                            message: data.note
                        };
                        notifsArray.push(notifModel);
                    }
                });
                resolve(); // Resolve the promise after processing all data
            },
            (error) => {
                reject(error);
            }
        );
    });

    const applicationPromise = new Promise((resolve, reject) => {
        const applicationRef = database.ref(`${DBPaths.APPLICATIONS}`);
        applicationRef.once('value',
            (snapshot) => {
                const promises = []; // Array to store promises for each applicant data
                snapshot.forEach((notif) => {
                    const data = notif.val();
                    if (data.status.toLowerCase() == 'pending') {
                        const promise = getApplicantsData(data.applicantId, data.applicationDateCreated);
                        promises.push(promise); // Store promise in array
                    }
                });
                // Resolve the promise after all applicant data is processed
                Promise.all(promises).then(() => resolve()).catch((error) => reject(error));
            },
            (error) => {
                reject(error);
            }
        );
    });

    Promise.all([revisionPromise, applicationPromise])
        .then(() => {
            console.log(notifsArray);

            notifsArray.sort(compareDates);
            notifsArray.reverse();

            notifsArray.forEach((notif) => {
                createNotifItem(notif.message);
            });
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
        
}

function getApplicantsData(applicantsId, applicationDateCreated) {
    return new Promise((resolve, reject) => { // Return a promise
        const ref = database.ref(`${DBPaths.PASSENGERS}`).child(applicantsId);
        ref.once('value',
            (snapshot) => {
                const passData = snapshot.val();
                if (passData) {
                    const notifModel = {
                        date: applicationDateCreated,
                        message: `${passData.fullName} has applied for a job.`
                    };
                    notifsArray.push(notifModel);
                    resolve(); // Resolve the promise after processing applicant data
                } else {
                    resolve(); // Resolve the promise if no data found
                }
            },
            (error) => {
                console.error('Error fetching data:', error);
                reject(error);
            }
        );
    });
}


function createNotifItem(message) {
    const parentDiv = document.querySelector('.bus-notif-content');

    // Create notification container
    const notificationContainer = document.createElement('div');
    notificationContainer.classList.add('notification-items');

    // Create icon element
    const icon = document.createElement('i');
    icon.classList.add('fa-regular', 'fa-user');

    // Create notification text element
    const notificationTextElement = document.createElement('span');
    notificationTextElement.classList.add('notif-item');
    notificationTextElement.textContent = `${message}`;

    // Append icon and text to the container
    notificationContainer.appendChild(icon);
    notificationContainer.appendChild(notificationTextElement);

    parentDiv.appendChild(notificationContainer);
}
