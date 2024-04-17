import { DBPaths } from '/Bus Operator/js/DB.js';
import firebaseConfig from '/CONFIG.js';

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('password');

document.getElementById('loginMainForm').addEventListener('submit', loginUser);

function loginUser(event) {
    event.preventDefault();

    let accountExists = false; // Flag to track if the account exists

    const userRef = database.ref(`${DBPaths.BUS_OPS}`);
    const username = usernameInput.value;
    const password = passwordInput.value;

    userRef.once('value', (snapshot) => {
        snapshot.forEach((user) => {
            const userKey = user.key;
            const data = user.val();
            const dbEmail = data.email; // Access email from user data
            const dbPassword = data.password; // Access password from user data

            if (username === dbEmail && password == dbPassword) {
                saveLoginTime(userKey, data);
                window.location.href = '/Bus Operator/dashboard.html'; // Redirect if credentials match
                accountExists = true; // Set flag to true if account exists
                data["key"] = userKey;
                console.log(data);
                sessionStorage.setItem('currentUser', JSON.stringify(data));
                return;
            }

            return
        });

        if (!accountExists) {
            alert('Account does not exist');
        }
    });
}

function saveLoginTime(userId, data) {

    const loginDetailsData = {
        id: userId,
        fullName: data.fullName,
        role: 'operator',
        loginDateTime: new Date().toISOString()
    }

    const userRef = database.ref(`${DBPaths.LOGIN_NOTIF}`);

    userRef.push(loginDetailsData)
        .then(() => {
            hideAddBusCoopModal();
            // getBusCoop();
        })
        .catch(error => {
            // An error occurred while setting data
            console.error('Error setting data:', error);
        });
}

