import { convertToMilitaryTime, convertTo12Hour, convertToPascal, getCurrentDateTimeInMillis } from '/Bus Operator/utils/Utils.js';
import { DBPaths } from '/Bus Operator/js/DB.js';
import firebaseConfig from '/CONFIG.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const myData = JSON.parse(sessionStorage.getItem('currentUser'));

const loader = document.querySelector('.loader-container');

const profilePhoto = document.getElementById('profilePhotoId');
const fullName = document.getElementById('profileFullname');
const email = document.getElementById('profileEmail');
const contact = document.getElementById('profileContact');
const coopImage = document.getElementById('coopImage');
const companyAddressElement = document.querySelector('.company-address-text');
const companyDescriptionElement = document.querySelector('.company-description-text');

let fileName;
let file;


document.getElementById('updateProfileButton').addEventListener('click', saveProfileInDb);
document.addEventListener('DOMContentLoaded', fillProfile);

window.addEventListener('load', function () {
    document.querySelector('#addProfilePicBtn').addEventListener('change', function (event) {
        if (this.files && this.files[0]) {
            profilePhoto.onload = () => {
                URL.revokeObjectURL(profilePhoto.src);
            }
            profilePhoto.src = URL.createObjectURL(this.files[0]);
            fileName = this.files[0].name;
            file = event.target.files[0];
        }
    });
});

function fillProfile() {

    const imgPlaceHolder = '/Bus Operator/images/profile.png';
    const imgPlaceHolde2 = '/Bus Operator/images/image-not-avail.png';

    fullName.value = myData.fullName || 'Loading...';
    email.value = myData.email || 'Loading...';
    contact.value = myData.phoneNum || 'Loading...';
    profilePhoto.src = myData.imageUrl || imgPlaceHolder;
    coopImage.src = myData.imgUrl || imgPlaceHolde2;

     // Fetch additional data from Bus Cooperative
     const ref = database.ref(`${DBPaths.BUS_COOP}`);
     ref.once('value', (coopSnapshot) => {
         coopSnapshot.forEach((coop) => {
             const coopData = coop.val();
             if (coopData.companyName === myData.companyName) {
                 // Populate additional data
                 coopImage.src = coopData.imgUrl || '';
                 companyAddressElement.textContent = coopData.companyAddress || 'Unknown Address';
                 companyDescriptionElement.textContent = coopData.companyDescription || 'No description available';
             }
         });
     });
 }

function saveProfileInDb() {

    const profilePicInput = document.getElementById('addProfilePicBtn');
    const profileFullname = document.getElementById('profileFullname');
    const profileEmail = document.getElementById('profileEmail');
    const profileContact = document.getElementById('profileContact');

    showLoader();

        if (profilePicInput && (profilePicInput.files.length === 0 || profilePicInput.value === '')) {
            updateProfile(myData.imageUrl);
        } else {
            uploadProfilePhoto();
        }

        // Check if elements exist before accessing their values
         if (profileFullname && profileEmail && profileContact) {
            const fullname = profileFullname.value;
            const email = profileEmail.value;
            const contact = profileContact.value;
        // Proceed with saving profile data
        } else {
            console.error("One or more profile input elements not found.");
        }

    hideLoader();
}

function uploadProfilePhoto() {
    const ref = firebase.storage().ref(`${DBPaths.BUS_OPS}`);

    const metadata = {
        contentType: file.type
    };

    const task = ref.child(fileName).put(file, metadata);

    // Monitor the upload progress
    task.on('state_changed',
        function (snapshot) {
            // Handle progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
        },
        function (error) {
            // Handle errors
            console.error('Error uploading file: ', error);
        },
        function () {
            // Handle successful upload
            task.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                console.log(downloadURL);
                updateProfile(downloadURL);
                // Save the downloadURL to your database or use it as needed
            });
        }
    );
}

function updateProfile(url) {
    // Construct data object to send to server
    const data = {
        fullName: fullName.value,
        email: email.value,
        imageUrl: url,
        phoneNum: contact.value
    };

    if (data.fullName !== myData.fullName ||
        data.email !== myData.email ||
        data.imageUrl !== myData.imageUrl ||
        data.phoneNum !== myData.phoneNum) {

        const id = myData.key;
        const userRef = firebase.database().ref(`${DBPaths.BUS_OPS}/${id}`);
        userRef.update(data)
            .then(() => {
                myData.key = id;
                myData.fullName = data.fullName;
                myData.email = data.email;
                myData.imageUrl = data.imageUrl;
                myData.phoneNum = data.phoneNum;

                sessionStorage.setItem('currentUser', JSON.stringify(myData));
                fillProfile();
                alert('Profile updated successfully!')
            })
            .catch(error => {
                console.error('Error updating multiple fields:', error);
            });

    }

}

// function savePassword(newPassword) {

//     const id = myData.key;

//     const data = {
//         password: newPassword,
//     };

//     const userRef = firebase.database().ref(`${DBPaths.BUS_OPS}/${id}`);
//     userRef.update(data)
//         .then(() => {
//             myData.password = data.password;
//             sessionStorage.setItem('currentUser', JSON.stringify(myData));

//             alert('Password updated!')
//         })
//         .catch(error => {
//             console.error('Change Password Error:', error);
//         });
// }

function showLoader() {
    const loader = document.querySelector('.loader-container');
    loader.style.display = 'flex'
}

function hideLoader() {
    const loader = document.querySelector('.loader-container');
    loader.style.display = "none";
}